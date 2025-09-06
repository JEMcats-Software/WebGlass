function makeDraggable(el) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    el.style.position = "absolute";
    el.style.cursor = "grab";

    el.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = el.offsetLeft;
        startTop = el.offsetTop;
        el.style.cursor = "grabbing";
        e.preventDefault(); // prevent text selection
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // Calculate new position relative to document based on mouse movement
        let newX = startLeft + (e.clientX - startX);
        let newY = startTop + (e.clientY - startY);

        // Boundaries
        const maxX = document.documentElement.scrollWidth - el.offsetWidth;
        const maxY = document.documentElement.scrollHeight - el.offsetHeight;

        newX = Math.max(0, Math.min(maxX, newX));
        newY = Math.max(0, Math.min(maxY, newY));

        el.style.left = newX + "px";
        el.style.top = newY + "px";
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            el.style.cursor = "grab";
        }
    });
}