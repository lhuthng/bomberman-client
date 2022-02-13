const Global = { 
    focus: {
        target: undefined,
        setTarget: function(target) {
            if (target !== this.target && this.target !== undefined) this.target.customEvent.trigger('unfocus');
            this.target = target;
            return target;
        }
    }
}

export default Global;