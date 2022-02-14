const Global = { 
    focus: {
        target: undefined,
        setTarget: function(target) {
            if (target !== this.target && this.target !== undefined) {
                this.target.customEvent.trigger('unfocus');
                this.target.isTargeted = false;
            }
            this.target = target;
            target && (target.isTargeted = true);
            return target;
        }
    }
}

export default Global;