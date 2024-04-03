/**
 *
 * @param {string} id
 * @param {string} string
 */
export function setInnerHTMLById(id, string) {
    let element = document.getElementById(id);
    if (element == undefined) {
        alert("attempt to change not existing element: " + id)
        console.error("attempt to change not existing element: " + id);
        return
    }

    element.innerHTML = string
}

/**
 *
 * @param {string} id
 * @param {string} string
 */
export function addToInnerHTMLById(id, string) {
    let element = document.getElementById(id);
    if (element == undefined) {
        alert("attempt to change not existing element: " + id)
        console.error("attempt to change not existing element: " + id);
        return
    }

    element.innerHTML += string
}

/**
 *
 * @param {string} id
 * @param {string} string
 */
export function setInnerTextById(id, string) {
    let element = document.getElementById(id);
    if (element == undefined) {
        alert("attempt to change not existing element: " + id)
        console.error("attempt to change not existing element: " + id);
        return
    }

    element.innerText = string
}

/**
 *
 * @param {string} id
 */
export function scrollDownById(id) {
    let element = document.getElementById(id);
    if (element == undefined) {
        alert("attempt to change not existing element: " + id)
        console.error("attempt to change not existing element: " + id);
        return
    }

    element.scrollTop = 999999
}