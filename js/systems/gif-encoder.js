(function() {
    "use strict";

    function medianCutQuantize(pixels, maxColors) {
        var samples = [];
        var step = Math.max(1, Math.floor(pixels.length / 4 / 10000)) * 4;
        for (var i = 0; i < pixels.length; i += step) {
            samples.push([pixels[i], pixels[i+1], pixels[i+2]]);
        }
        var boxes = [samples];
        while (boxes.length < maxColors) {
            var bestIdx = 0, bestRange = -1;
            for (var i = 0; i < boxes.length; i++) {
                if (boxes[i].length < 2) continue;
                var range = boxRange(boxes[i]);
                if (range.range > bestRange) { bestRange = range.range; bestIdx = i; }
            }
            if (bestRange <= 0) break;
            var box = boxes[bestIdx];
            var dim = boxRange(box).dim;
            box.sort(function(a, b) { return a[dim] - b[dim]; });
            var mid = box.length >> 1;
            boxes.splice(bestIdx, 1, box.slice(0, mid), box.slice(mid));
        }
        return boxes.map(function(b) {
            if (b.length === 0) return [0,0,0];
            var r=0,g=0,bl=0;
            for (var j = 0; j < b.length; j++) { r+=b[j][0]; g+=b[j][1]; bl+=b[j][2]; }
            return [Math.round(r/b.length), Math.round(g/b.length), Math.round(bl/b.length)];
        });
    }

    function boxRange(box) {
        var minR=255,maxR=0,minG=255,maxG=0,minB=255,maxB=0;
        for (var i = 0; i < box.length; i++) {
            var c = box[i];
            if(c[0]<minR)minR=c[0]; if(c[0]>maxR)maxR=c[0];
            if(c[1]<minG)minG=c[1]; if(c[1]>maxG)maxG=c[1];
            if(c[2]<minB)minB=c[2]; if(c[2]>maxB)maxB=c[2];
        }
        var rR=maxR-minR, rG=maxG-minG, rB=maxB-minB;
        if (rR >= rG && rR >= rB) return {dim:0,range:rR};
        if (rG >= rR && rG >= rB) return {dim:1,range:rG};
        return {dim:2,range:rB};
    }

    function nearestPaletteIndex(palette, r, g, b) {
        var best = 0, bestD = Infinity;
        for (var i = 0; i < palette.length; i++) {
            var dr = r-palette[i][0], dg = g-palette[i][1], db = b-palette[i][2];
            var d = dr*dr + dg*dg + db*db;
            if (d < bestD) { bestD = d; best = i; }
        }
        return best;
    }

    function lzwEncode(indexStream, minCodeSize) {
        var clearCode = 1 << minCodeSize;
        var eoiCode = clearCode + 1;
        var codeSize = minCodeSize + 1;
        var nextCode = eoiCode + 1;
        var output = [];
        var buf = 0, bits = 0;

        function emit(code) {
            buf |= code << bits;
            bits += codeSize;
            while (bits >= 8) { output.push(buf & 0xff); buf >>= 8; bits -= 8; }
        }

        var table = new Map();
        function resetTable() {
            table.clear();
            for (var i = 0; i < clearCode; i++) table.set(String(i), i);
            nextCode = eoiCode + 1;
            codeSize = minCodeSize + 1;
        }

        resetTable();
        emit(clearCode);
        var prefix = String(indexStream[0]);
        for (var i = 1; i < indexStream.length; i++) {
            var k = String(indexStream[i]);
            var key = prefix + ',' + k;
            if (table.has(key)) { prefix = key; }
            else {
                emit(table.get(prefix));
                if (nextCode < 4096) {
                    table.set(key, nextCode++);
                    if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
                } else { emit(clearCode); resetTable(); }
                prefix = k;
            }
        }
        emit(table.get(prefix));
        emit(eoiCode);
        if (bits > 0) output.push(buf & 0xff);
        return output;
    }

    function buildGIF(frames, palette, width, height, delay) {
        var buf = [];
        function writeByte(b) { buf.push(b & 0xff); }
        function writeShort(v) { buf.push(v & 0xff); buf.push((v >> 8) & 0xff); }
        function writeString(s) { for (var i = 0; i < s.length; i++) buf.push(s.charCodeAt(i)); }

        writeString('GIF89a');
        writeShort(width); writeShort(height);
        writeByte(0xf7); writeByte(0); writeByte(0);

        for (var i = 0; i < 256; i++) {
            if (i < palette.length) { writeByte(palette[i][0]); writeByte(palette[i][1]); writeByte(palette[i][2]); }
            else { writeByte(0); writeByte(0); writeByte(0); }
        }

        writeByte(0x21); writeByte(0xff); writeByte(11);
        writeString('NETSCAPE2.0');
        writeByte(3); writeByte(1); writeShort(0); writeByte(0);

        for (var fi = 0; fi < frames.length; fi++) {
            writeByte(0x21); writeByte(0xf9); writeByte(4);
            writeByte(0x00); writeShort(delay); writeByte(0); writeByte(0);
            writeByte(0x2c);
            writeShort(0); writeShort(0); writeShort(width); writeShort(height);
            writeByte(0);
            var minCodeSize = 8;
            writeByte(minCodeSize);
            var compressed = lzwEncode(frames[fi], minCodeSize);
            var pos = 0;
            while (pos < compressed.length) {
                var chunkSize = Math.min(255, compressed.length - pos);
                writeByte(chunkSize);
                for (var j = 0; j < chunkSize; j++) writeByte(compressed[pos++]);
            }
            writeByte(0);
        }
        writeByte(0x3b);
        return new Uint8Array(buf);
    }

    Studio.Systems.GIFEncoder = {
        medianCutQuantize: medianCutQuantize,
        nearestPaletteIndex: nearestPaletteIndex,
        buildGIF: buildGIF
    };
})();
