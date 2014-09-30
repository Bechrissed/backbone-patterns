( function( root, factory ) {
    // Set up Ahold-Backbone for the environment. Start with AMD.
    if ( typeof define === 'function' && define.amd ) {
        define( [ 'exports', 'backbone', 'underscore' ], factory );
    }
    // Next for Node.js or CommonJS.
    else if ( typeof exports !== 'undefined' ) {
        factory( exports, require( 'backbone' ), require( 'underscore' ) );
    }
    // Finally, as a browser global. Use `root` here as it references `window`.
    else {
        factory( root, root.Backbone, root._ );
    }
}( this, function( exports, Backbone, _ ) {;Backbone.utils = {};
Backbone.utils.readonly = (function (obj) {
    var descriptor;
    if (typeof Object.defineProperty !== "undefined") {
        descriptor = {
            writable: false,
            enumerable: true,
            configurable: false
        };

        var props = (arguments.length > 1) ? _.toArray(arguments).slice(1) : [];
        _.each(props, function (prop) {
            descriptor.value = obj[prop];
            try {
                Object.defineProperty(obj, prop, descriptor);
            } catch (error) {}
        });
        return true;
    }

    return false;
});;/*global Backbone, _ */

Backbone.mediator = function () {};

_.extend(Backbone.mediator.prototype, {
    subscribe: function (name, handler, scope) {
        Backbone.Events.on.apply(this, arguments);
    },

    subscribeOnce: function (name, handler, scope) {
        Backbone.Events.once.apply(this, arguments);
    },

    unsubscribe: function (name, handler, scope) {
        Backbone.Events.off.apply(this, arguments);
    },

    publish: function (name) {
        Backbone.Events.trigger.apply(this, arguments);
    },

    setResponder: function (name, responder, scope) {
        this.handlers || (this.handlers = []);
        this.handlers[name] = {
            responder: responder,
            scope: scope
        };
    },

    request: function (name) {
        if (this.handlers && this.handlers[name]) {
            var scope = this.handlers[name].scope || null,
                props = (arguments.length > 1) ? _.toArray(arguments).slice(1) : [];

            return this.handlers[name].responder.apply(scope, props);
        }
        throw Error('Backbone.mediator -> Response handler for (' + name + ') is not registered');
    }
});

Backbone.mediator = new Backbone.mediator();
Backbone.utils.readonly(Backbone.mediator, 'subscibe', 'subscibeOnce', 'unsubscribe', 'publish');


;/*global Backbone, _ */
Backbone.decorators || (Backbone.decorators = {});
Backbone.decorators.PubSub = {
    subscribe: function (name, handler, scope) {
        Backbone.mediator.subscribe.apply(Backbone.mediator, arguments);
    },

    subscribeOnce: function (name, handler, scope) {
        Backbone.mediator.subscribeOnce.apply(Backbone.mediator, arguments);
    },

    unsubscribe: function (name, handler, scope) {
        Backbone.mediator.unsubscribe.apply(Backbone.mediator, arguments);
    },

    publish: function (name, value) {
        Backbone.mediator.publish.apply(Backbone.mediator, arguments);
    }
};;/*global Backbone, _ */
Backbone.decorators || (Backbone.decorators = {});
Backbone.decorators.RequestResponse = {
    setResponder: function (name, responder, scope) {
        Backbone.mediator.setResponder.apply(Backbone.mediator, arguments);
    },

    request: function (name) {
        return Backbone.mediator.request.apply(Backbone.mediator, arguments);
    }
};;Backbone.Collection.prototype.inspect = (function (attrs) {
    var results = [];
    _.each(this.models, function (model) {
        results = results.concat(model.inspect(attrs));
    });
    return results;
});
;Backbone.Collection.prototype.findModel = (function (attrs, first) {
    var results = this.inspect(attrs);
    return (first) ? results[0] || null : results;
});;Backbone.Model.prototype.inspectAttributes = (function (attrs) {
    var results = [];
    _.each(this.attributes, function (attribute) {
        if (attribute instanceof Backbone.Collection) {
            results = results.concat(attribute.inspect(attrs));
        } else if (attribute instanceof Backbone.Model) {
            results = results.concat(attribute.inspect(attrs));
        }
    });
    return results;
});
;Backbone.Model.prototype.inspect = (function (attrs) {
    var results = this.inspectAttributes(attrs),
        matches = true;

    for (var key in attrs) {
        if (this.get(key) !== attrs[key]) {
            matches = false;
            break;
        }
    }

    if (matches) {
        results.push(this);
    }

    return results;
});

;var oldProto = Backbone.View.prototype,
    extend = Backbone.View.extend,
    ctor = Backbone.View;

Backbone.View = function (options) {
    options || (options = {});
    if (this.optionNames) {
        _.extend(this, _.pick(options, this.optionNames));
    }

    ctor.apply(this, arguments);
    this._subscribeToEvents();
};

Backbone.View.prototype = oldProto;
Backbone.View.extend = extend;
;/*global Backbone, _ */

_.extend(Backbone.View.prototype, Backbone.decorators.PubSub, Backbone.decorators.RequestResponse);;Backbone.View.prototype.renderMethod = "append"; //append, replace, prepend
Backbone.View.prototype.templateEngine = "dust"; //dust

Backbone.View.prototype.render = (function () {
    if (typeof this.template !== 'function') {
        throw Error('Template is not a function!');
    }
    var appendView = (function (element) {
            if (this.renderMethod === 'replace') {
                this.setElement(element);
            } else {
                this.$el[this.renderMethod](
                    element
                );
            }
        }.bind(this));

    if (this.templateEngine === 'dust') {
        this.template(this.getTemplateData(), function (err, out) {
            appendView(out);
        });
    } else {
        appendView(this.template(this.getTemplateData()));
    }

    return this;
});

Backbone.View.prototype.getTemplateData = (function () {
    return null;
});
;Backbone.View.prototype._subscribeToEvents = (function () {
    if (this.subscribeTo) {
        for (var key in this.subscribeTo) {
            if (typeof this[this.subscribeTo[key]] === 'function') {
                this.subscribe(key, this[this.subscribeTo[key]], this);
            }
        }
    }
});

Backbone.View.prototype._unSubscribeToEvents = (function () {
    if (this.subscribeTo) {
        for (var key in this.subscribeTo) {
            if (typeof this[this.subscribeTo[key]] === 'function') {
                this.unsubscribe(key, this[this.subscribeTo[key]], this);
            }
        }
    }
});
;var oldRemove = Backbone.View.prototype.remove;
Backbone.View.prototype.remove = (function () {
    this._unSubscribeToEvents();
    oldRemove.apply(this, arguments);
});
;return Backbone;

}));