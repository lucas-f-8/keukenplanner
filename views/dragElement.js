dragElement(document.getElementById("overlay"));

function dragElement(elmnt) {
    let offsetX = 0, offsetY = 0;
    let isDragging = false;

    const header = document.getElementById(elmnt.id + "header") || elmnt;

    header.addEventListener("mousedown", onPointerDown);
    header.addEventListener("touchstart", onPointerDown, { passive: false });

    function onPointerDown(e) {
        e.preventDefault();

        let clientX, clientY;

        if (e.type === "touchstart") {
            if (e.touches.length !== 1) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            document.addEventListener("touchmove", onPointerMove, { passive: false });
            document.addEventListener("touchend", onPointerUp);
            document.addEventListener("touchcancel", onPointerUp);
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
            document.addEventListener("mousemove", onPointerMove);
            document.addEventListener("mouseup", onPointerUp);
        }

        if (elmnt.dataset.offscreenLocked === "true") {
            console.log("Unlocking element on drag start");
            unlockElement();
        }

        const rect = elmnt.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        isDragging = true;
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        let clientX, clientY;

        if (e.type === "touchmove") {
            if (e.touches.length !== 1) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        moveElement(clientX, clientY);
    }

    function onPointerUp(e) {
        if (!isDragging) return;

        if (e.type.startsWith("touch")) {
            document.removeEventListener("touchmove", onPointerMove);
            document.removeEventListener("touchend", onPointerUp);
            document.removeEventListener("touchcancel", onPointerUp);
        } else {
            document.removeEventListener("mousemove", onPointerMove);
            document.removeEventListener("mouseup", onPointerUp);
        }

        isDragging = false;
        checkIfShouldLock();
    }

    function moveElement(clientX, clientY) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let newLeft = clientX - offsetX;
        let newTop = clientY - offsetY;

        // Prevent from dragging too far left or above
        newLeft = Math.max(newLeft, -elmnt.offsetWidth * 0.6);
        newTop = Math.max(newTop, 0);

        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
    }

    function checkIfShouldLock() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const horizThreshold = elmnt.offsetWidth * 0.4;
    const vertThreshold = elmnt.offsetHeight * 0.3;

    const rect = elmnt.getBoundingClientRect();

    const isLeftOff = rect.left < -horizThreshold;
    const isRightOff = rect.right > vw + horizThreshold;
    const isBottomOff = rect.bottom > vh + vertThreshold;
    const isTopOff = rect.top < -vertThreshold;

    let shouldLock = false;

    if (isLeftOff) {
        elmnt.classList.add("offscreen-horizontal");
        elmnt.style.width = "10vh";
        elmnt.style.height = "10vh";
        // Zet positie na grootte aanpassing
        elmnt.style.left = "0px";
        shouldLock = true;
    } else if (isRightOff) {
        elmnt.classList.add("offscreen-horizontal");
        elmnt.style.width = "10vh";
        elmnt.style.height = "10vh";
        // Zet positie na grootte aanpassing
        elmnt.style.left = (vw - elmnt.offsetWidth) + "px";
        shouldLock = true;
    } else {
        elmnt.classList.remove("offscreen-horizontal");
    }

    if (isTopOff) {
        elmnt.classList.add("offscreen-vertical");
        elmnt.style.width = "10vh";
        elmnt.style.height = "10vh";
        // Zet positie na grootte aanpassing
        elmnt.style.top = "0px";
        shouldLock = true;
    } else if (isBottomOff) {
        elmnt.classList.add("offscreen-vertical");
        elmnt.style.width = "10vh";
        elmnt.style.height = "10vh";
        // Zet positie na grootte aanpassing
        elmnt.style.top = (vh - elmnt.offsetHeight) + "px";
        shouldLock = true;
    } else {
        elmnt.classList.remove("offscreen-vertical");
    }

    if (shouldLock) {
        elmnt.dataset.offscreenLocked = "true";
        console.log("Element locked at left:", elmnt.style.left, "top:", elmnt.style.top);
    }
}

function unlockElement() {


    // Wacht tot nieuwe grootte is toegepast en offsetWidth klopt
    requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = elmnt.getBoundingClientRect();

        let left = rect.left;
        let top = rect.top;

        if (left + rect.width > vw) left = vw - rect.width;
        if (top + rect.height > vh) top = vh - rect.height;
        if (left < 0) left = 0;
        if (top < 0) top = 0;

        elmnt.style.left = left + "px";
        elmnt.style.top = top + "px";

        console.log("Element unlocked at left:", elmnt.style.left, "top:", elmnt.style.top);
    });

        elmnt.classList.remove("offscreen-horizontal");
    elmnt.classList.remove("offscreen-vertical");
    delete elmnt.dataset.offscreenLocked;

    elmnt.style.width = "35%";
    elmnt.style.height = "80%";
}

}
