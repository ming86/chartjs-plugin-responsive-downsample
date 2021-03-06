
/**
 * Check if a value is null or undefined
 */
export function isNil(value: any): value is null | undefined {
    return (typeof value === "undefined") || value === null;
}

/**
 * Clamp a number to a range
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Recursivly assign default values to an object if object is missing the keys.
 * @param object The destination object to assign default values to
 * @param defaults The default values for the object
 * @return The destination object 
 */
export function defaultsDeep<T>(object: T, defaults: Partial<T>): T {
    for (let key in defaults) {
        const value = object[key];

        if (typeof value === "undefined") {
            object[key] = defaults[key];
        } else if (value !== null && typeof value === "object") {
            object[key] = defaultsDeep(value, defaults[key]);
        }
    }

    return object;
}


/**
 * Finds the first element in an array for that the comaperator functions returns true
 * 
 * @export
 * @template T Element type of the array
 * @param {Array<T>} array An array
 * @param {(element: T) => boolean} compareFunction Comperator function returning true for the element seeked
 * @returns {T} The found element or undefined
 */
export function findInArray<T>(array: Array<T>, compareFunction: (element: T) => boolean) : T{
    if(isNil(array)) return undefined;
    for (var i = 0; i < array.length; i++){
        if(compareFunction(array[i]) === true) {
            return array[i];            
        }
    }
    return undefined;
}


/**
 * Finds the first index in an array for that the comaperator function for an element returns true
 * 
 * @export
 * @template T 
 * @param {Array<T>} array An array of elements
 * @param {(element: T) => boolean} compareFunction Comperator function returning true for the element seeked 
 * @returns {number} Index of the matched element or -1 if no element was found
 */
export function findIndexInArray<T>(array: Array<T>, compareFunction: (element: T) => boolean) : number{
    if(isNil(array)) return undefined;
    for (var i = 0; i < array.length; i++){
        if(compareFunction(array[i]) === true) {
            return i;
        }
    }
    return -1;
}