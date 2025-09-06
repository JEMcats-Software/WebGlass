// WebGlass.js
// Generates Realistic Looking Glass In CSS For The Web.
// Script by JEMcats.Software

console.log("WebGlass by JEMcats.Software.")
console.log("Starting WebGlass...")

// --- Define WebGlass Main Functions ---
const WebGlass = {
    // --- Define preset types of glass ---
    glassPresets: {
        "Glass": { blur: 0, transparency: 0.2, isLiquid: false },
        "Frosted Glass": { blur: 4, transparency: 0.1, isLiquid: false },
        "Liquid Glass": { depth: 7.5, blur: 2, chromaticAberration: 10, transparency: 0.1, isLiquid: true },
        "Stained Glass": { blur: 0, transparency: 0.3, isLiquid: false },
        "Stained Frosted Glass": { blur: 4, transparency: 0.2, isLiquid: false },
        "Stained Liquid Glass": { depth: 7.5, blur: 2, chromaticAberration: 10, transparency: 0.2, isLiquid: true }
    },

    // --- Makes new glassy "div" ---
    CreateGlass: function ({ height, width, depth, radius, strength, chromaticAberration, blur = 2, debug = false, color, transparency, isLiquid = true, preset }) {
        if (preset && WebGlass.glassPresets[preset]) {
            const presetValues = WebGlass.glassPresets[preset];
            blur = presetValues.blur ?? blur;
            transparency = presetValues.transparency ?? transparency;
            isLiquid = presetValues.isLiquid ?? isLiquid;
            depth = presetValues.depth ?? depth;
            chromaticAberration = presetValues.chromaticAberration ?? chromaticAberration;
        }

        this.height = height;
        this.width = width;
        this.baseDepth = depth;
        this.radius = radius;
        this.strength = strength;
        this.chromaticAberration = chromaticAberration;
        this.blur = blur;
        this.debug = debug;
        this.clicked = false;
        this.color = color;
        this.transparency = transparency
        this.isLiquid = isLiquid

        this.el = document.createElement("div");
        this.el.style.height = this.height
        this.el.style.width = this.width
        this.el.style.borderRadius = this.radius
        this.applyBaseStyles(this.el, false, color, transparency);
        this.updateStyle();

        this.el.addEventListener("mousedown", () => {
            this.clicked = true;
            this.updateStyle();
        });
        this.el.addEventListener("mouseup", () => {
            this.clicked = false;
            this.updateStyle();
        });
        return this.el;
    },

    // --- Makes existing "divs" glassy ---
    Glassify: function (existingEl, { depth, blur, chromaticAberration, debug = false, color, transparency, isLiquid = true, preset } = {}) {
        // if (!(existingEl instanceof HTMLElement)) {
        //     console.error("Glassify: Provided element is not valid.");
        //     return;
        // }
        if (preset && WebGlass.glassPresets[preset]) {
            const presetValues = WebGlass.glassPresets[preset];
            depth = presetValues.depth ?? depth;
            blur = presetValues.blur ?? blur;
            chromaticAberration = presetValues.chromaticAberration ?? chromaticAberration;
            transparency = presetValues.transparency ?? transparency;
            isLiquid = presetValues.isLiquid ?? isLiquid;
        }

        if (depth !== undefined) this.baseDepth = depth;
        if (blur !== undefined) this.blur = blur;
        if (chromaticAberration !== undefined) this.chromaticAberration = chromaticAberration;

        // Get computed styles if inline styles are not set
        const computedStyle = window.getComputedStyle(existingEl);

        let heightValue = existingEl.style.height || computedStyle.height;
        let widthValue = existingEl.style.width || computedStyle.width;
        let radiusValue = existingEl.style.borderRadius || computedStyle.borderRadius;

        this.debug = debug;
        this.color = color;
        this.transparency = transparency;
        this.isLiquid = isLiquid
        this.height = parseInt(heightValue, 10);
        this.width = parseInt(widthValue, 10);
        this.radius = parseInt(radiusValue, 10);

        this.el = existingEl;
        // these should already be defined
        // existingEl.style.height
        // existingEl.style.width
        // existingEl.style.borderRadius
        this.applyBaseStyles(existingEl, true, color, transparency);
        this.updateStyle();

        return this.el;
    },

    // --- Styles "divs" in a glass compatible way ---
    applyBaseStyles: function (el, pre, color, transparency) {
        this.el.style.background = WebGlass.buildRgba(color, transparency);
        el.style.boxShadow = "inset 0 0 4px 0px white";
        el.style.cursor = "pointer";
        if (!pre) {
            el.style.height = this.height + "px";
            el.style.width = this.width + "px";
            el.style.borderRadius = this.radius + "px";
        }
        this.el.style.transition = "backdrop-filter 1s cubic-bezier(1, 0, 0, 1)"
    },

    // --- Applys glassy filters ---
    updateStyle: function () {
        let el_style = this.el.style;
        el_style.background = WebGlass.buildRgba(this.color, this.transparency);

        let depth = this.baseDepth / (this.clicked ? 0.7 : 1);
        let nonchrome = !window.chrome;

        if (this.debug) {
            el_style.background = `url("${WebGlass.getDisplacementMap({
                height: this.height,
                width: this.width,
                radius: this.radius,
                depth
            })}")`;
            el_style.boxShadow = "none";
        } else {
            if (nonchrome || this.isLiquid == false) {
                el_style.backdropFilter =
                    `blur(${this.blur / 2}px) blur(${this.blur}px) brightness(1.1) saturate(1.5)`;
            } else {
                el_style.backdropFilter =
                    `blur(${this.blur / 2}px) url('${WebGlass.getDisplacementFilter({
                        height: this.height,
                        width: this.width,
                        radius: this.radius,
                        depth,
                        strength: this.strength,
                        chromaticAberration: this.chromaticAberration
                    })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;
            }
        }
    },

    // --- Displacement Map Generator ---
    getDisplacementMap: function ({ height, width, radius, depth }) {
        return "data:image/svg+xml;utf8," +
            encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
            .mix { mix-blend-mode: screen; }
        </style>
        <defs>
            <linearGradient 
            id="Y" 
            x1="0" 
            x2="0" 
            y1="${Math.ceil((radius / height) * 15)}%" 
            y2="${Math.floor(100 - (radius / height) * 15)}%">
                <stop offset="0%" stop-color="#0F0" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
            <linearGradient 
            id="X" 
            x1="${Math.ceil((radius / width) * 15)}%" 
            x2="${Math.floor(100 - (radius / width) * 15)}%"
            y1="0" 
            y2="0">
                <stop offset="0%" stop-color="#F00" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
        </defs>

        <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
        <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
        <rect
            x="${depth}"
            y="${depth}"
            height="${height - 2 * depth}"
            width="${width - 2 * depth}"
            fill="#808080"
            rx="${radius}"
            ry="${radius}"
            filter="blur(${depth}px)"
        />
        </g>
    </svg>`);
    },

    // --- Displacement Filter Generator ---
    getDisplacementFilter: function ({ height, width, radius, depth, strength = 100, chromaticAberration = 0 }) {
        return "data:image/svg+xml;utf8," +
            encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="displace" color-interpolation-filters="sRGB">
                <feImage x="0" y="0" height="${height}" width="${width}" href="${WebGlass.getDisplacementMap({ height, width, radius, depth })}" result="displacementMap" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap"
                    scale="${strength + chromaticAberration * 2}"
                    xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix"
                    values="1 0 0 0 0
                            0 0 0 0 0
                            0 0 0 0 0
                            0 0 0 1 0"
                    result="displacedR" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap"
                    scale="${strength + chromaticAberration}"
                    xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix"
                    values="0 0 0 0 0
                            0 1 0 0 0
                            0 0 0 0 0
                            0 0 0 1 0"
                    result="displacedG" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap"
                    scale="${strength}"
                    xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix"
                    values="0 0 0 0 0
                            0 0 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0"
                    result="displacedB" />
                <feBlend in="displacedR" in2="displacedG" mode="screen"/>
                <feBlend in2="displacedB" mode="screen"/>
            </filter>
        </defs>
    </svg>`) + "#displace";
    },

    // --- Converts HTML HexCodes to RGB ---
    hexToRgb: function (hex) {
        // Remove # if present
        hex = hex.replace(/^#/, "");

        // Handle shorthand hex (#abc -> #aabbcc)
        if (hex.length === 3) {
            hex = hex.split("").map(char => char + char).join("");
        }

        if (hex.length !== 6) {
            throw new Error("Invalid HEX color.");
        }

        // Convert to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        return { r, g, b };
    },

    // --- Build RGBA color string from hex and transparency ---
    buildRgba: function (color, transparency) {
        let alpha = (transparency === undefined || transparency === null) ? 0.4 : transparency;
        if (color) {
            let RGBcol = WebGlass.hexToRgb(color);
            return `rgba(${RGBcol.r},${RGBcol.g},${RGBcol.b},${alpha})`;
        } else {
            return `rgba(255,255,255,${alpha})`;
        }
    }
}

console.log("WebGlass Ready!")