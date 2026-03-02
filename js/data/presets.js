(function() {
    "use strict";
    Studio.Data.Presets = [
        { name:"Ocean Sunrise", category:"landscapes", layers:[{pattern:"Aurora",palette:"Deep Ocean",params:{seed:12.5,scale:2.0,warp:1.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.4,vignette:0.3,grain:0.04,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Cosmic Dust", category:"cosmic", layers:[{pattern:"Nebula",palette:"Twilight",params:{seed:45,scale:1.8,warp:2.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.6,vignette:0.5,grain:0.06,chromatic:0.3,sharpen:0,lensDistortion:0}},
        { name:"Liquid Chrome", category:"abstract", layers:[{pattern:"Liquid Metal",palette:"Obsidian",params:{seed:20,scale:1.5,warp:1.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.2,grain:0.02,chromatic:0.5,sharpen:0.3,lensDistortion:0}},
        { name:"Neon Dreams", category:"vibrant", layers:[{pattern:"Plasma",palette:"Neon",params:{seed:30,scale:2.5,warp:2.0},opacity:1,blendMode:"normal"},{pattern:"Prism Swirl",palette:"Cyberpunk",params:{seed:55,scale:1.5,warp:1.0},opacity:0.4,blendMode:"screen"}], postFx:{bloom:0.7,vignette:0.4,grain:0.03,chromatic:1.0,sharpen:0,lensDistortion:0.2}},
        { name:"Misty Forest", category:"organic", layers:[{pattern:"Volumetric Mist",palette:"Moss",params:{seed:18,scale:2.0,warp:1.8},opacity:1,blendMode:"normal"}], postFx:{bloom:0.5,vignette:0.6,grain:0.08,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Cherry Blossom", category:"organic", layers:[{pattern:"Petal Drift",palette:"Sakura",params:{seed:42,scale:1.8,warp:1.2},opacity:1,blendMode:"normal"}], postFx:{bloom:0.45,vignette:0.35,grain:0.05,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Deep Space", category:"cosmic", layers:[{pattern:"Nebula",palette:"Midnight",params:{seed:88,scale:1.5,warp:1.0},opacity:1,blendMode:"normal"},{pattern:"Crescent",palette:"Golden Hour",params:{seed:15,scale:2.0,warp:0.5},opacity:0.6,blendMode:"add"}], postFx:{bloom:0.5,vignette:0.5,grain:0.06,chromatic:0.2,sharpen:0,lensDistortion:0}},
        { name:"Silk Road", category:"organic", layers:[{pattern:"Silk Waves",palette:"Warm Sunset",params:{seed:33,scale:2.2,warp:2.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.3,grain:0.04,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Arctic Aurora", category:"landscapes", layers:[{pattern:"Aurora",palette:"Frost",params:{seed:60,scale:2.5,warp:2.0},opacity:1,blendMode:"normal"},{pattern:"Soft Orbs",palette:"Aurora Borealis",params:{seed:25,scale:1.5,warp:0.5},opacity:0.3,blendMode:"screen"}], postFx:{bloom:0.5,vignette:0.4,grain:0.05,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Lava Flow", category:"dark", layers:[{pattern:"Silk Waves",palette:"Volcanic",params:{seed:70,scale:1.8,warp:3.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.6,vignette:0.5,grain:0.03,chromatic:0.2,sharpen:0,lensDistortion:0}},
        { name:"Minimal Fog", category:"minimal", layers:[{pattern:"Spectral Haze",palette:"Monochrome",params:{seed:10,scale:3.0,warp:0.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.2,vignette:0.6,grain:0.08,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Stained Glass", category:"geometric", layers:[{pattern:"Glass Blocks",palette:"Holographic",params:{seed:50,scale:1.2,warp:0.3},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.3,grain:0.02,chromatic:0.3,sharpen:0.2,lensDistortion:0}},
        { name:"Vortex", category:"abstract", layers:[{pattern:"Prism Swirl",palette:"Synthwave",params:{seed:65,scale:2.0,warp:1.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.5,vignette:0.4,grain:0.04,chromatic:0.5,sharpen:0,lensDistortion:0.3}},
        { name:"Cotton Clouds", category:"minimal", layers:[{pattern:"Soft Orbs",palette:"Cotton Candy",params:{seed:22,scale:1.5,warp:0.8},opacity:1,blendMode:"normal"}], postFx:{bloom:0.6,vignette:0.2,grain:0.02,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Moonrise", category:"cosmic", layers:[{pattern:"Crescent",palette:"Ocean Depths",params:{seed:5,scale:2.0,warp:1.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.4,vignette:0.5,grain:0.06,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Ember Glow", category:"warm", layers:[{pattern:"Plasma",palette:"Ember",params:{seed:40,scale:2.0,warp:1.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.7,vignette:0.4,grain:0.03,chromatic:0.2,sharpen:0,lensDistortion:0}},
        { name:"Voronoi Dream", category:"geometric", layers:[{pattern:"Voronoi Cells",palette:"Lavender Dreams",params:{seed:30,scale:1.5,warp:1.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.3,grain:0.03,chromatic:0,sharpen:0.2,lensDistortion:0}},
        { name:"Electric Storm", category:"energy", layers:[{pattern:"Electric Arcs",palette:"Cyberpunk",params:{seed:77,scale:1.0,warp:2.0},opacity:1,blendMode:"normal"},{pattern:"Nebula",palette:"Midnight",params:{seed:55,scale:1.5,warp:0.5},opacity:0.3,blendMode:"screen"}], postFx:{bloom:0.8,vignette:0.3,grain:0.04,chromatic:1.0,sharpen:0,lensDistortion:0}},
        { name:"Zen Garden", category:"minimal", layers:[{pattern:"Topographic Lines",palette:"Sandstone",params:{seed:15,scale:1.5,warp:0.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.2,vignette:0.5,grain:0.06,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Fractal Universe", category:"mathematical", layers:[{pattern:"Julia Fractal",palette:"Aurora Borealis",params:{seed:35,scale:1.2,warp:1.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.4,vignette:0.3,grain:0.02,chromatic:0.3,sharpen:0,lensDistortion:0}},
        { name:"Smoke Machine", category:"organic", layers:[{pattern:"Smoke",palette:"Obsidian",params:{seed:28,scale:2.0,warp:2.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.5,grain:0.08,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Crystal Cave", category:"geometric", layers:[{pattern:"Crystal Lattice",palette:"Frost",params:{seed:50,scale:1.0,warp:0.8},opacity:1,blendMode:"normal"},{pattern:"Soft Orbs",palette:"Arctic",params:{seed:20,scale:2.0,warp:0.3},opacity:0.25,blendMode:"add"}], postFx:{bloom:0.5,vignette:0.3,grain:0.03,chromatic:0.4,sharpen:0.2,lensDistortion:0}},
        { name:"Sunset Boulevard", category:"cinematic", layers:[{pattern:"Aurora",palette:"Warm Sunset",params:{seed:55,scale:2.5,warp:2.0},opacity:1,blendMode:"normal"},{pattern:"Volumetric Mist",palette:"Golden Hour",params:{seed:30,scale:1.5,warp:1.0},opacity:0.35,blendMode:"overlay"}], postFx:{bloom:0.5,vignette:0.6,grain:0.06,chromatic:0.2,sharpen:0,lensDistortion:0.1}},
        { name:"Tile Mosaic", category:"geometric", layers:[{pattern:"Truchet Tiles",palette:"Coral Reef",params:{seed:42,scale:1.0,warp:0.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.2,vignette:0.3,grain:0.02,chromatic:0,sharpen:0.3,lensDistortion:0}},
        { name:"Acid Rain", category:"vibrant", layers:[{pattern:"Flow Field",palette:"Neon",params:{seed:90,scale:2.0,warp:3.0},opacity:1,blendMode:"normal"}], postFx:{bloom:0.6,vignette:0.3,grain:0.04,chromatic:0.8,sharpen:0,lensDistortion:0.2}},
        { name:"Genetic Code", category:"scientific", layers:[{pattern:"DNA Helix",palette:"Aurora Borealis",params:{seed:12,scale:1.0,warp:1.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.4,vignette:0.4,grain:0.05,chromatic:0.3,sharpen:0,lensDistortion:0}},
        { name:"Wave Interference", category:"abstract", layers:[{pattern:"Interference Rings",palette:"Deep Ocean",params:{seed:35,scale:1.0,warp:0.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.4,vignette:0.3,grain:0.03,chromatic:0,sharpen:0,lensDistortion:0}},
        { name:"Mountain Ridge", category:"landscapes", layers:[{pattern:"Terrain",palette:"Forest Floor",params:{seed:60,scale:2.0,warp:0.8},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.5,grain:0.06,chromatic:0,sharpen:0.2,lensDistortion:0}},
        { name:"Woven Dreams", category:"texture", layers:[{pattern:"Woven Fabric",palette:"Sandstone",params:{seed:25,scale:0.8,warp:0.3},opacity:1,blendMode:"normal"}], postFx:{bloom:0.2,vignette:0.4,grain:0.04,chromatic:0,sharpen:0.2,lensDistortion:0}},
        { name:"Kaleidoscope Vision", category:"abstract", layers:[{pattern:"Kaleidoscope",palette:"Holographic",params:{seed:55,scale:1.5,warp:1.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.5,vignette:0.3,grain:0.02,chromatic:0.5,sharpen:0,lensDistortion:0.2}},
        { name:"Bio Patterns", category:"scientific", layers:[{pattern:"Reaction-Diffusion",palette:"Moss",params:{seed:40,scale:1.0,warp:0.8},opacity:1,blendMode:"normal"}], postFx:{bloom:0.3,vignette:0.4,grain:0.05,chromatic:0,sharpen:0.2,lensDistortion:0}},
        { name:"Noir", category:"cinematic", layers:[{pattern:"Volumetric Mist",palette:"Monochrome",params:{seed:18,scale:2.5,warp:1.5},opacity:1,blendMode:"normal"},{pattern:"Aurora",palette:"Infrared",params:{seed:60,scale:2.0,warp:1.0},opacity:0.15,blendMode:"add"}], postFx:{bloom:0.3,vignette:0.7,grain:0.12,chromatic:0,sharpen:0.1,lensDistortion:0}},
        { name:"Peach Sorbet", category:"pastel", layers:[{pattern:"Soft Orbs",palette:"Peach Glow",params:{seed:30,scale:2.0,warp:0.5},opacity:1,blendMode:"normal"}], postFx:{bloom:0.5,vignette:0.2,grain:0.02,chromatic:0,sharpen:0,lensDistortion:0}}
    ];

    Studio.Data.PresetCategories = [
        { id: "all", name: "All" },
        { id: "landscapes", name: "Landscapes" },
        { id: "abstract", name: "Abstract" },
        { id: "cosmic", name: "Cosmic" },
        { id: "minimal", name: "Minimal" },
        { id: "vibrant", name: "Vibrant" },
        { id: "dark", name: "Dark" },
        { id: "organic", name: "Organic" },
        { id: "geometric", name: "Geometric" },
        { id: "cinematic", name: "Cinematic" },
        { id: "scientific", name: "Scientific" }
    ];
})();
