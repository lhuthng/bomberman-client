const Utils = {
    event: () => {
        const group = {};
        const on = (name, callback) => {
            if (!group[name]) group[name] = [];
            group[name].push(callback);
        }
        const off = (name, callback) => {
            if (!name) return;
            if (!callback) delete group[name];
            else {
                const index = group[name].findIndex(element => element === callback);
                if (index > 0) group[name].splice(index, 1);
            }
        }
        const trigger = (name, ...args) => {
            group[name] && group[name].forEach(callback => callback(...args));
        }
        return { on, off, trigger };
    },
    constrain: (value, min, max) => {
        return value < min ? min : value > max ? max : value;
    }
}

export default Utils;