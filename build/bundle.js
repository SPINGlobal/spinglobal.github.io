
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const TESTIMONIALS = [
        {
            text: 'SPIN Global helped us elevate our program to a strong, viable emergency management program that supports the community and develops resilience. The training products have been a tremendous hit with the public and the staff in our City.',
            name: 'Emergency Management Coordinator',
            title: 'City Of Fairfax',
        },
        {
            text: 'We were able to possess factual, data-driven information to assist the recovery team in making assessments and operational decisions for resources and funding.',
            name: 'Director',
            title: 'North Carolina Emergency Management'
        },
        {
            text: 'Shaken Fury 2019 highlighted S&T as a go-to partner for technology and innovation benefitting responders and emergency managers.',
            name: 'Under Secretary’s Award for Building Partnerships',
            title: 'DHS Science & Technology'
        },
        {
            text: 'Having the team from SPIN Global was a game changer. Our project required a lot of work in terms of pre-planning and research development. The work they did was very detailed and thorough. Halfway through the project, our planning needs changed. SPIN Global was able to pivot to the new goals without missing a beat. Being able to adapt to changes benefitted not only our agency, but all of our stakeholders involved in the project.',
            title: 'Federal Emergency Management Agency',
            name: 'Emergency Management Planner'
        },
        {
            text: 'The assessment and workshop was a really good stick on our journey to understand how we can better use evidence, better use storytelling, and better use good science and intelligence to lead change and to have a more resilient City.',
            title: 'Wellington, New Zealand',
            name: 'Chief Resilience Officer'
        }
    ];

    /* src/pages/Splash.svelte generated by Svelte v3.31.2 */

    const file = "src/pages/Splash.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Disrupting Disasters, From Neighborhoods To Nations";
    			attr_dev(h1, "class", "font_header-primary text-left w-max-n2 pl-l6 pb-l6 svelte-r4b33h");
    			set_style(h1, "color", "white");
    			add_location(h1, file, 1, 4, 46);
    			attr_dev(div, "class", "splash-surface flex-col--cl svelte-r4b33h");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Splash", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Splash> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Splash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Testimonial.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/components/Testimonial.svelte";

    // (14:12) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "font_text-primary pb-l1");
    			add_location(p, file$1, 14, 16, 520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(14:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:12) {#if title !== ''}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*title*/ ctx[2]);
    			attr_dev(p, "class", "font_text-primary text-center pb-l1");
    			add_location(p, file$1, 12, 16, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:12) {#if title !== ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let h2;
    	let t4;
    	let t5;

    	function select_block_type(ctx, dirty) {
    		if (/*title*/ ctx[2] !== "") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p = element("p");
    			t0 = text("\"");
    			t1 = text(/*text*/ ctx[0]);
    			t2 = text("\"");
    			t3 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t4 = text(/*name*/ ctx[1]);
    			t5 = space();
    			if_block.c();
    			attr_dev(p, "class", "font_text-primary text-italic text-center pr-l1 pl-l1 pt-l0 pb-l0");
    			add_location(p, file$1, 8, 8, 216);
    			attr_dev(h2, "class", "font_header-secondary");
    			add_location(h2, file$1, 10, 12, 332);
    			add_location(div0, file$1, 9, 8, 314);
    			attr_dev(div1, "class", "testimonial-surface br-px8 m-auto-l4 w-max-n2 svelte-ip75mb");
    			add_location(div1, file$1, 7, 4, 148);
    			attr_dev(div2, "class", "testimonial-background of-auto svelte-ip75mb");
    			add_location(div2, file$1, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t4);
    			append_dev(div0, t5);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t1, /*text*/ ctx[0]);
    			if (dirty & /*name*/ 2) set_data_dev(t4, /*name*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testimonial", slots, []);
    	let { text = "" } = $$props;
    	let { name = "" } = $$props;
    	let { title = "" } = $$props;
    	const writable_props = ["text", "name", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testimonial> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ text, name, title });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, name, title];
    }

    class Testimonial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { text: 0, name: 1, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonial",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get text() {
    		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Testimonial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Testimonial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var MusicalRatios;
    (function (MusicalRatios) {
        MusicalRatios[MusicalRatios["Unison"] = 1] = "Unison";
        MusicalRatios[MusicalRatios["MinorSecond"] = 1.067] = "MinorSecond";
        MusicalRatios[MusicalRatios["MajorSecond"] = 1.125] = "MajorSecond";
        MusicalRatios[MusicalRatios["MinorThird"] = 1.2] = "MinorThird";
        MusicalRatios[MusicalRatios["MajorThird"] = 1.25] = "MajorThird";
        MusicalRatios[MusicalRatios["PerfectFourth"] = 1.333] = "PerfectFourth";
        MusicalRatios[MusicalRatios["DiminishedFifth"] = 1.4] = "DiminishedFifth";
        MusicalRatios[MusicalRatios["AugmentedFourth"] = 1.414] = "AugmentedFourth";
        MusicalRatios[MusicalRatios["PerfectFifth"] = 1.5] = "PerfectFifth";
        MusicalRatios[MusicalRatios["MinorSixth"] = 1.6] = "MinorSixth";
        MusicalRatios[MusicalRatios["GoldenRatio"] = 1.618] = "GoldenRatio";
        MusicalRatios[MusicalRatios["MajorSixth"] = 1.667] = "MajorSixth";
        MusicalRatios[MusicalRatios["MinorSeventh"] = 1.75] = "MinorSeventh";
        MusicalRatios[MusicalRatios["MajorSeventh"] = 1.875] = "MajorSeventh";
        MusicalRatios[MusicalRatios["Octave"] = 2] = "Octave";
    })(MusicalRatios || (MusicalRatios = {}));
    function intervalToRatio(interval) {
        return MusicalRatios[interval];
    }
    function ratioToPower(ratio, power) {
        return Math.pow(ratio, power);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var cssCustomProperties_min = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){return function(t){function e(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var r={};return e.m=t,e.c=r,e.i=function(t){return t},e.d=function(t,r,n){e.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:n});},e.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(r,"a",r),r},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=1)}([function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},o=(e.isArray=function(t){return t&&Array.isArray(t)},e.isString=function(t){return t&&"string"==typeof t}),i=e.isObject=function(t){return t&&"object"===(void 0===t?"undefined":n(t))},u=(e.forEach=function(t,e){if(i(t))for(var r in t)t.hasOwnProperty(r)&&e(r,t[r]);},e.set=function(t,e,r){return i(t)?(t[e]=r,t):t},e.startsWith=function(t,e){return o(t)&&t.startsWith(e)},e.isNumber=function(t){return !isNaN(t)&&"Infinity"!==t});e.formatResult=function(t){return u(t)?parseFloat(t,10):t},e.unprefixString=function(t,e){return t.startsWith(e)?t.slice(e.length):t},e.prefixString=function(t,e){return t.startsWith(e)?t:""+e+t};},function(t,e,r){function n(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),u=r(0),f=function(){function t(){o(this,t);}return i(t,null,[{key:"get",value:function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t.root;if(r&&t.isValidName(e)){var n=getComputedStyle(r),o=n.getPropertyValue(t.prefix(e)),i=o&&o.trim();return i&&""!==i?(0, u.formatResult)(i):void 0}}},{key:"getAll",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:t.root;if(e){var r={};return (0, u.forEach)(e.style,function(n,o){if((0, u.startsWith)(o,"--")){var i=o;(0, u.set)(r,t.unprefix(i),t.get(i,e));}}),r}}},{key:"getAllPrefixed",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:t.root;return t.prefix(t.getAll(e))}},{key:"has",value:function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t.root;return !!t.get(e,r)}},{key:"set",value:function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t.root;if(r){if(!e)return {};var n={};return (0, u.forEach)(e,function(e,o){t.setProperty(e,o,r),(0, u.set)(n,t.unprefix(e),t.get(e,r));}),n}}},{key:"setProperty",value:function(e,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:t.root;if(n&&t.isValidName(e))return n.style.setProperty(t.prefix(e),r),r}},{key:"unset",value:function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t.root;if(r&&t.isValidName(e)){var o=t.get(e,r);return t.set(n({},e,null),r),o}}},{key:"unsetAll",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:t.root;if(e){var r=t.getAll(e);return (0, u.forEach)(r,function(r,n){t.unset(r,e);}),r}}},{key:"getElement",value:function(t){return document.querySelector(t)}},{key:"prefix",value:function(t){if((0, u.isString)(t))return (0, u.prefixString)(t,"--");if((0, u.isArray)(t))return t.map(function(t){return (0, u.prefixString)(t,"--")});if((0, u.isObject)(t)){var e={};return (0, u.forEach)(t,function(t,r){(0, u.set)(e,(0, u.prefixString)(t,"--"),r);}),e}}},{key:"unprefix",value:function(t){if((0, u.isString)(t))return (0, u.unprefixString)(t,"--");if((0, u.isArray)(t))return t.map(function(t){return (0, u.unprefixString)(t,"--")});if((0, u.isObject)(t)){var e={};return (0, u.forEach)(t,function(t,r){(0, u.set)(e,(0, u.unprefixString)(t,"--"),r);}),e}}},{key:"isValidName",value:function(t){return (0, u.isString)(t)}},{key:"root",get:function(){return t.getElement(":root")}}]),t}();e.default=f,t.exports=e.default;}])});
    });

    var cssProps = /*@__PURE__*/getDefaultExportFromCjs(cssCustomProperties_min);

    var MusicalRatios$1;
    (function (MusicalRatios) {
        MusicalRatios[MusicalRatios["Unison"] = 1] = "Unison";
        MusicalRatios[MusicalRatios["MinorSecond"] = 1.067] = "MinorSecond";
        MusicalRatios[MusicalRatios["MajorSecond"] = 1.125] = "MajorSecond";
        MusicalRatios[MusicalRatios["MinorThird"] = 1.2] = "MinorThird";
        MusicalRatios[MusicalRatios["MajorThird"] = 1.25] = "MajorThird";
        MusicalRatios[MusicalRatios["PerfectFourth"] = 1.333] = "PerfectFourth";
        MusicalRatios[MusicalRatios["DiminishedFifth"] = 1.4] = "DiminishedFifth";
        MusicalRatios[MusicalRatios["AugmentedFourth"] = 1.414] = "AugmentedFourth";
        MusicalRatios[MusicalRatios["PerfectFifth"] = 1.5] = "PerfectFifth";
        MusicalRatios[MusicalRatios["MinorSixth"] = 1.6] = "MinorSixth";
        MusicalRatios[MusicalRatios["GoldenRatio"] = 1.618] = "GoldenRatio";
        MusicalRatios[MusicalRatios["MajorSixth"] = 1.667] = "MajorSixth";
        MusicalRatios[MusicalRatios["MinorSeventh"] = 1.75] = "MinorSeventh";
        MusicalRatios[MusicalRatios["MajorSeventh"] = 1.875] = "MajorSeventh";
        MusicalRatios[MusicalRatios["Octave"] = 2] = "Octave";
    })(MusicalRatios$1 || (MusicalRatios$1 = {}));
    function ratioToInterval(ratio) {
        return MusicalRatios$1[ratio];
    }
    function ratioToPower$1(ratio, power) {
        return Math.pow(ratio, power);
    }

    function pxToRelative(px, baseFontSize = 16, min) {
        let size = px / baseFontSize;
        size = min && size < min ? min : size;
        return size.toFixed(4);
    }
    function pxToEm(px, baseFontSize = 16, min) {
        return `${pxToRelative(px, baseFontSize, min)}em`;
    }
    function ensureNotPxEm(unit, baseFontSize) {
        if (typeof unit === 'string') {
            if (unit.includes('px')) {
                const val = parseFloat(unit.replace('px', ''));
                unit = pxToEm(val, baseFontSize);
            }
        }
        else {
            unit = pxToEm(unit, baseFontSize);
        }
        return unit;
    }

    class MediaQueryManager extends EventTarget {
        constructor(breaks, baseFontSize = 16) {
            super();
            this._watchers = [];
            this._breaks = [];
            this._active = 0;
            this._finalBreaks = [];
            this._handler = () => {
                for (let i = 0; i < this._watchers.length; i++) {
                    if (this._watchers[i].matches) {
                        this._active = this._breaks[i];
                        break;
                    }
                }
                this._changed();
            };
            this.destroy = () => this._watchers.forEach(e => e.removeEventListener('change', this._handler));
            this._finalBreaks = [...breaks, 99999];
            for (const pt of this._finalBreaks) {
                const dim = ensureNotPxEm(pt, baseFontSize);
                const query = `(max-width: ${dim})`;
                const watcher = window.matchMedia(query);
                watcher.addEventListener('change', this._handler);
                this._watchers.push(watcher);
                this._breaks.push(pt);
            }
            this._handler();
        }
        _changed() {
            const event = new CustomEvent('change', { detail: { active: this.active } });
            this.dispatchEvent(event);
        }
        get breaks() {
            return this._breaks.sort((a, b) => a - b);
        }
        get active() {
            return this._active;
        }
    }

    function centeredRange(start, end, stpSize = 1) {
        const out = new Set();
        let count = 0;
        for (let i = -stpSize; i > start - 1; i -= stpSize) {
            out.add(start + stpSize * count++);
        }
        out.add(0);
        count = 1;
        for (let i = stpSize; i < end + 1; i += stpSize) {
            out.add(stpSize * count++);
        }
        return Array.from(out);
    }
    const rhymicBreakpointsDefaultParams = {
        baseWidth: 1280,
        ratio: MusicalRatios$1.PerfectFifth,
        highBpCount: 3,
        lowBpCount: -3,
        stepSize: 1,
        baseFont: 16
    };
    const defaultRatios = [
        MusicalRatios$1.MajorSecond,
        MusicalRatios$1.MinorThird,
        MusicalRatios$1.MajorThird,
        MusicalRatios$1.PerfectFourth,
        MusicalRatios$1.DiminishedFifth,
        MusicalRatios$1.AugmentedFourth,
        MusicalRatios$1.PerfectFifth,
        MusicalRatios$1.GoldenRatio
    ];
    class RhythmicBreakpoints extends MediaQueryManager {
        constructor(params = {}) {
            const { baseWidth, ratio, highBpCount, lowBpCount, stepSize, baseFont } = Object.assign(Object.assign({}, rhymicBreakpointsDefaultParams), params);
            const range = centeredRange(lowBpCount, highBpCount, stepSize);
            const bpWidths = range.map(e => baseWidth * ratioToPower$1(ratio, e));
            super(bpWidths);
            this._baseFont = baseFont;
            this._breakpointRatioMap = new Map();
            for (const breakPt of this.breaks)
                this._breakpointRatioMap.set(breakPt, ratioToInterval(MusicalRatios$1.Unison));
        }
        static createDefaultInstance() {
            const mediaManager = new RhythmicBreakpoints();
            mediaManager.breaks.map((e, i) => mediaManager.setBpInterval(e, ratioToInterval(defaultRatios[i])));
            return mediaManager;
        }
        handleUpdateBaseFont() {
            document.querySelector('html').style.fontSize = `${this._baseFont / 16 * 100}%`;
        }
        setBpInterval(breakPt, interval) {
            if (!this._breakpointRatioMap.has(breakPt))
                throw new Error(`Invalid breakpoint: ${breakPt}`);
            this._breakpointRatioMap.set(breakPt, interval);
        }
        getBpInterval(breakPt) {
            if (!this._breakpointRatioMap.has(breakPt))
                throw new Error(`Invalid breakpoint: ${breakPt}`);
            return this._breakpointRatioMap.get(breakPt);
        }
        get breakpointRatioMap() {
            return new Map(this._breakpointRatioMap);
        }
        set breakpointRatioMap(map) {
            const keys = Object.keys(map);
            if (keys.sort().join(',') !== this.breaks.join(',')) {
                throw new Error('invalid keys in map');
            }
            this._breakpointRatioMap = map;
        }
        shiftBreakpoint(breakpoint, shift) {
            const index = this.breaks.indexOf(breakpoint);
            if (index === -1)
                throw new Error('Invalid breakpoint');
            const shiftedIndex = index + shift;
            if (shiftedIndex < 0) {
                return this.breaks[0];
            }
            if (shiftedIndex >= this.breaks.length) {
                return this.breaks[this.breaks.length - 1];
            }
            else {
                return this.breaks[shiftedIndex];
            }
        }
    }

    function pxToRelative$1(px, baseFontSize = 16, min) {
        let size = px / baseFontSize;
        size = min && size < min ? min : size;
        return size.toFixed(4);
    }
    function pxToRem(px, baseFontSize = 16, min) {
        return `${pxToRelative$1(px, baseFontSize, min)}rem`;
    }
    function ensureNotPxRem(unit, baseFontSize, min) {
        if (typeof unit === 'string') {
            if (unit.includes('px')) {
                const val = parseFloat(unit.replace('px', ''));
                unit = pxToRem(val, baseFontSize, min);
            }
        }
        else {
            unit = pxToRem(unit, baseFontSize, min);
        }
        return unit;
    }

    const rhythmicScaleDefaultParams = {
        baseFont: 10,
        baseBrowserFontSize: 16,
        lineHeightFactor: 1.2
    };
    function scaledSize(ratio, level, size = 1) {
        return size * ratioToPower(ratio, level);
    }
    class RhythmicScale {
        constructor(params = {}) {
            const { baseFont, baseBrowserFontSize, lineHeightFactor } = Object.assign(Object.assign({}, rhythmicScaleDefaultParams), params);
            this.baseFont = baseFont;
            this.baseBrowserFontSize = baseBrowserFontSize;
            this.lineHeightFactor = lineHeightFactor;
        }
        scaledStyles(ratio, level, min) {
            const scaled = scaledSize(ratio, level, this.baseFont);
            return {
                size: ensureNotPxRem(scaled, this.baseBrowserFontSize),
                lineHeight: ensureNotPxRem(scaled * this.lineHeightFactor, this.baseBrowserFontSize, min)
            };
        }
    }

    const baseFont = 16;

    const mediaManager = RhythmicBreakpoints.createDefaultInstance();
    const handleUpdateBaseFont = () => mediaManager.handleUpdateBaseFont();

    const rhythmicScale = new RhythmicScale({baseFont});

    function handleBPChange() {
        const ratio = intervalToRatio(mediaManager.getBpInterval(mediaManager.active));
        const cssVars = {};

        for (let i = 0; i <= 4; i++) {
            const scaledStyles = rhythmicScale.scaledStyles(ratio, -i, .9);
            const size = `n${i}`;
            cssVars[`modular-break-pt-${size}`] = ensureNotPxRem(mediaManager.shiftBreakpoint(mediaManager.active, -i), baseFont);
            cssVars[`modular-size-${size}`] = scaledStyles.size;
            cssVars[`modular-line-height-${size}`] = scaledStyles.lineHeight;
        }
        for (let i = 0; i <= 10; i++) {
            const scaledStyles = rhythmicScale.scaledStyles(ratio, i, .9);
            cssVars[`modular-break-pt-l${i}`] = ensureNotPxRem(mediaManager.shiftBreakpoint(mediaManager.active, i), baseFont);
            cssVars[`modular-size-l${i}`] = scaledStyles.size;
            cssVars[`modular-line-height-l${i}`] = scaledStyles.lineHeight;
        }
        cssProps.set(cssVars);
    }

    handleBPChange();

    mediaManager.addEventListener('change', () => {
        handleBPChange();
    });

    /* src/components/Page.svelte generated by Svelte v3.31.2 */

    const file$2 = "src/components/Page.svelte";

    // (9:4) {#if text}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "font_text-primary w-max-n1 text-center mt-l0");
    			add_location(p, file$2, 9, 8, 270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = /*text*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) p.innerHTML = /*text*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(9:4) {#if text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let div0_id_value;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let if_block = /*text*/ ctx[1] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*headerText*/ ctx[0]);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "page-link relative svelte-116w83v");
    			attr_dev(div0, "id", div0_id_value = /*headerText*/ ctx[0].toLowerCase().replace(/ /g, "_"));
    			add_location(div0, file$2, 6, 4, 105);
    			attr_dev(h1, "class", "font_header-primary");
    			add_location(h1, file$2, 7, 4, 197);
    			attr_dev(div1, "class", "flex-col--tc mt-l3");
    			add_location(div1, file$2, 5, 0, 68);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*headerText*/ 1 && div0_id_value !== (div0_id_value = /*headerText*/ ctx[0].toLowerCase().replace(/ /g, "_"))) {
    				attr_dev(div0, "id", div0_id_value);
    			}

    			if (!current || dirty & /*headerText*/ 1) set_data_dev(t1, /*headerText*/ ctx[0]);

    			if (/*text*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Page", slots, ['default']);
    	let { headerText } = $$props;
    	let { text } = $$props;
    	const writable_props = ["headerText", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("headerText" in $$props) $$invalidate(0, headerText = $$props.headerText);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ headerText, text });

    	$$self.$inject_state = $$props => {
    		if ("headerText" in $$props) $$invalidate(0, headerText = $$props.headerText);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headerText, text, $$scope, slots];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { headerText: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*headerText*/ ctx[0] === undefined && !("headerText" in props)) {
    			console.warn("<Page> was created without expected prop 'headerText'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<Page> was created without expected prop 'text'");
    		}
    	}

    	get headerText() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerText(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Capabilities.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/pages/Capabilities.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (50:8) {#each capabilities as cap}
    function create_each_block(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h2;
    	let t1_value = /*cap*/ ctx[2].text[0] + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*cap*/ ctx[2].text.slice(1) + "";
    	let t3;
    	let t4;
    	let a;
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			a = element("a");
    			t5 = text("Learn More.");
    			t6 = space();
    			attr_dev(img, "class", "cap-icon svelte-1l21yak");
    			attr_dev(img, "alt", "capability icon");
    			if (img.src !== (img_src_value = "./capabilities/" + /*cap*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 51, 16, 2065);
    			attr_dev(h2, "class", "font_header-secondary inline");
    			set_style(h2, "margin-right", "-5px");
    			add_location(h2, file$3, 54, 20, 2198);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", ctx[2].file);
    			add_location(a, file$3, 57, 24, 2411);
    			attr_dev(p, "class", "font_text-primary inline");
    			add_location(p, file$3, 55, 20, 2306);
    			attr_dev(div0, "class", "ml-l0");
    			add_location(div0, file$3, 52, 16, 2157);
    			attr_dev(div1, "class", "w-max-p100 m-n2 flex-row--cc");
    			add_location(div1, file$3, 50, 12, 2006);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, a);
    			append_dev(a, t5);
    			append_dev(div1, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(50:8) {#each capabilities as cap}",
    		ctx
    	});

    	return block;
    }

    // (48:0) <Page {...pageInfo}>
    function create_default_slot(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let each_value = /*capabilities*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "flex-col--tl mt-l4");
    			add_location(div0, file$3, 48, 4, 1925);
    			attr_dev(div1, "class", "mb-l3");
    			add_location(div1, file$3, 67, 4, 2644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*capabilities*/ 1) {
    				each_value = /*capabilities*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(48:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[1]];

    	let page_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 2)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[1])])
    			: {};

    			if (dirty & /*$$scope*/ 32) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Capabilities", slots, []);

    	const capabilities = [
    		{
    			text: "Data-driven assessments before, during, and after disasters.",
    			img: "data_icon.jpg",
    			file: "/capabilities/DataDrivenAssessments_Capabilities.pdf"
    		},
    		{
    			text: "Institutional capacity building and regional security cooperation.",
    			img: "institutional_icon.jpg",
    			file: "/capabilities/InstitutionalCapacityBuilding.pdf"
    		},
    		{
    			text: "Strategic consulting and program management services.",
    			img: "strategic_icon.jpg",
    			file: "/capabilities/StrategicConsultingProgramManagement_Capabilities.pdf"
    		},
    		{
    			text: "Rapid response and recovery support.",
    			img: "rapid_icon.jpg",
    			file: "/capabilities/RapidResponseRecovery.pdf"
    		},
    		{
    			text: "Universal risk reduction, resilience, and emergency management services.",
    			img: "universal_icon.jpg",
    			file: "/capabilities/Universal_Risk_Reduction_(Master Capabilities).pdf"
    		},
    		{
    			text: "Pre-disaster planning for all-hazards and incident types.",
    			img: "planning_icon.jpg",
    			file: "/capabilities/Planning_Capabilities.pdf"
    		},
    		{
    			text: "Training and exercises to prepare neighborhoods and nations.",
    			img: "teach_icon.jpg",
    			file: "/capabilities/Training_Exercise.pdf"
    		}
    	];

    	const pageInfo = {
    		headerText: "Featured Capabilities",
    		text: "How do we disrupt disasters? We provide customized solutions focused on disaster resilience, risk reduction, emergency and crisis management for private industry, governments, and communities. Visit our map below to learn more about our projects."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Capabilities> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, capabilities, pageInfo });
    	return [capabilities, pageInfo];
    }

    class Capabilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Capabilities",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/Platforms.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/pages/Platforms.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (29:8) {#each platforms as plat}
    function create_each_block$1(ctx) {
    	let a;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p;
    	let t2;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Visit";
    			t2 = space();
    			attr_dev(img, "class", "m svelte-ihnh44");
    			if (img.src !== (img_src_value = /*plat*/ ctx[4].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `${/*plat*/ ctx[4].title} Icon`);
    			set_style(img, "max-width", "420px");
    			set_style(img, "min-width", "240px");
    			add_location(img, file$4, 31, 24, 1134);
    			attr_dev(p, "class", "font_text-primary m-n2 svelte-ihnh44");
    			add_location(p, file$4, 33, 24, 1336);
    			attr_dev(div0, "class", "visit-surface br-px4 flex-col--cc mt-l2 svelte-ihnh44");
    			add_location(div0, file$4, 32, 20, 1258);
    			attr_dev(div1, "class", "platform-surface br-px8 flex-col--cc p-l5 m-l1 svelte-ihnh44");
    			add_location(div1, file$4, 30, 16, 1049);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", ctx[4].url);
    			add_location(a, file$4, 29, 12, 997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(a, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:8) {#each platforms as plat}",
    		ctx
    	});

    	return block;
    }

    // (27:0) <Page {...pageInfo}>
    function create_default_slot$1(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let each_value = /*platforms*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "flex-row--tc flex--wrap flex--space-around");
    			set_style(div0, "flex-direction", /*direction*/ ctx[0]);
    			add_location(div0, file$4, 27, 4, 857);
    			attr_dev(div1, "class", "mb-l3");
    			add_location(div1, file$4, 39, 4, 1478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*platforms*/ 4) {
    				each_value = /*platforms*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*direction*/ 1) {
    				set_style(div0, "flex-direction", /*direction*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(27:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[1]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 2)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[1])])
    			: {};

    			if (dirty & /*$$scope, direction*/ 129) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Platforms", slots, []);
    	const maxWidth = mediaManager.breaks[3];

    	let direction = mediaManager.active <= mediaManager.breaks[3]
    	? "column"
    	: "row";

    	mediaManager.addEventListener("change", e => {
    		$$invalidate(0, direction = mediaManager.active <= mediaManager.breaks[3]
    		? "column"
    		: "row");
    	});

    	const pageInfo = {
    		headerText: "Our Platforms",
    		text: "Our online disaster risk reduction and preparedness platforms are designed to make the world safer."
    	};

    	const platforms = [
    		{
    			icon: "/planetready.png",
    			url: "https://www.planetready.com"
    		},
    		{
    			icon: "/responder_cq.png",
    			url: "http://www.respondercq.com"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Platforms> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		mediaManager,
    		Page,
    		maxWidth,
    		direction,
    		pageInfo,
    		platforms
    	});

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [direction, pageInfo, platforms];
    }

    class Platforms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Platforms",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const TeamMembers = [
        {
            first_name: 'Mallory',
            last_name: 'Brown',
            title: 'Disaster Preparedness Specialist',
            bio: 'After being on the ground responding to some of the most significant disasters to impact the U.S. in the last decade, I wanted to join a team focused on developing innovative solutions for community resilience to improve outcomes for survivors.',
            education: ['Le Moyne College: B.A., Political Science, Gender & Women’s Studies', 'Arizona State University: M.A., Emergency Management & Homeland Security'],
            ask: ['Partnerships & Relationship Management', 'Community Engagement', 'Crisis Communications', 'Disaster Response', 'Traveling the world on a budget'],
            experience: 'Mallory’s emergency management experience began in 2011 with the American Red Cross, where she served until April 2020. In this role, she responded to over 300 home fires and other local disasters and completed 12 deployments to national disasters including Hurricane Harvey, Hurricane Irma, and the 2019 Dayton mass shooting. She also serves as Secretary of the Board of NY VOAD (Voluntary Organizations Active in Disaster). Prior to becoming involved in emergency management, she held marketing and communications roles for Bassett Healthcare Network, Carrols Corporation, and the Syracuse Post-Standard. At SPIN Global, Mallory supports our client efforts focused on disaster preparedness and mitigation.',
            ln: 'in/malloryabrown'
        },
        {
            first_name: 'Alwin',
            last_name: 'Sheriff',
            title: 'Media Specialist',
            bio: 'Alwin joined the SPIN Global team in 2019 because he was looking for an opportunity that would share his brand ideals and foster his creative capabilities. He has 5+ years in video production, storyboarding, and animation. He has produced 30+ videos, commercials, animated clips, graphics, and training videos for SPIN Clients and corporate distribution.',
            education: ['Montgomery College: A.A., Business Management', 'Maryland University: B.A., Business Management and Entrepreneurship Specialization.'],
            ask: ['Social Media and Marketing Campaign Directives', 'Video Production Operations', "How to make a funny Tiktok about Mac'n'Cheese"],
            experience: 'Alwin joined SPIN Global as an intern and became an employee soon after graduating from college. He has 5+ years in video production, storyboarding, and animation. He has produced dozens of videos, commercials, animated clips, graphics, and training videos for SPIN Global clients in the emergency management community.',
            ln: 'in/alwinthesheriff'
        },
        {
            first_name: 'Alexa',
            last_name: 'Squirini',
            title: 'Analyst',
            bio: 'Hurricane Sandy devastated my New Jersey hometown. I took emergency management classes in college and was a part of a program at a Department of Homeland Security-funded research institute. When I found SPIN Global through an internship in college, it was the perfect fit to blend my personal experience with disaster and my education. I desire to be a part of work that makes a difference in community resilience.',
            education: ['University of Maryland: B.A., Government & Politics, Global Terrorism Studies'],
            ask: ['GIS', 'Training', 'Exercises', 'How to make the best tacos and breakfast bowls'],
            experience: 'Prior to her employment with SPIN Global, Alexa was a student-athlete at UMD and worked at the National Consortium for the Study of Terrorism and Responses to Terrorism (START Center), as a Geographic Information Systems Intern as well as a TEVUS Intern. Alexa worked for the U.S. Department of Agriculture, Personnel Security and Suitability as well as the Partnership for Public Service. Alexa has had experience working domestically and internationally with SPIN Global and has worked to provide research, community engagement, planning, training, and exercise and administrative support services.',
            ln: 'in/alexa-maureen-squirini-3a4523b6'
        },
        {
            first_name: 'Dawn',
            last_name: 'Covin',
            title: 'Project Control Officer',
            bio: 'SPIN Global’s focus on improving disaster resilience outcomes from “Neighborhoods to Nations” aligns with my commitment to impact positive change for inner-city communities. As a part of a Public Benefit Corporation, it is inspiring to know that stewardship of resources is a priority.',
            education: ['University of North Carolina at Greensboro: B.S., Finance and Marketing', 'University of Delaware: MBA'],
            ask: ['PMP® Certification', 'Contracts Administration', 'Work-Life Integration'],
            experience: 'Dawn has 20+ years experience working as a Business Continuity and Disaster Recovery Consultant at IBM, developing disaster resilience strategies for companies throughout the US. Dawn is also a certified Project Management Professional (PMP) that has conducted research, performed business impact and risk assessments, facilitated simulated exercises, and provided mitigation recommendations to banks, insurance companies, government agencies, youth organizations, manufacturers, and retailers. Since SPIN Global was founded, Dawn has supported a vast array of client work with governments and private industry.',
            ln: 'in/dawncovin'
        },
        {
            first_name: 'Diane',
            last_name: 'Vickerman',
            title: 'Emergency Management Specialist',
            bio: 'I have always loved working to help others, and found the perfect fit with SPIN Global. I was drawn to emergency management after witnessing the devastating impacts of disasters to people’s lives.',
            education: ['University of California at Berkeley, Bachelor of Arts'],
            ask: ['Public Health', 'Emergency Management in Healthcare', 'Crisis Counseling', 'Ask me about North Shore Oahu local favorites.'],
            experience: 'In 2013 while working as a crisis counselor at a hospital Diane was recruited to the role of Emergency Preparedness Manager for Calaveras County Public Health in California. She was responsible for overseeing all aspects of disaster management including planning and preparedness, logistics and response. In her role at the county she was trained with an excellent understanding of the Incident Command System (ICS). After working in the public health field Diane had the opportunity to work at several hospitals overseeing emergency management including Wahiawa General Hospital in Hawaii and the Office of Emergency Management at Stanford Hospital. At SPIN Global, Diane supports all-hazards planning efforts with the federal government and private industry.',
            ln: 'company/spinglobal1'
        },
        {
            first_name: 'Camila',
            last_name: 'Tapias',
            title: 'Jr. Analyst',
            bio: 'Growing up in Colombia, I’ve always wanted to make a difference in the world by providing opportunities and useful resources for vulnerable communities. I decided to pursue a career in public affairs and consequently find a team where the integration of data, technology and innovation, and empathy were prioritized to efficiently support communities to become more resilient.',
            education: ['The George Washington University: B.A., Organizational Sciences, Psychology & Criminal Justice', 'The George Washington University: M.A., Public Administration, Crisis & Emergency Management'],
            ask: ['Higher Education', 'Preparedness', 'Youth & Young Professional Engagement', 'GIS', 'How to Salsa Dance'],
            experience: 'Prior to joining the team, she was a Presidential Fellow at The George Washington University where she worked at the Office of the President while obtaining her MPA, and was the primary point of contact for student outreach, communication, and safety. She collaborated with the Division of Safety and Security to improve the culture of preparedness, and led the efforts to update the university’s Closed Point of Dispensing Plan (CPOD) amidst the COVID-19 pandemic. Before she worked in higher education and emergency management, she played for her alma mater’s Division I Women’s Basketball team and also represented the Colombian national team for nine years. At SPIN Global, Camila supports our local government, private industry, higher education and international clients through research, training, and stakeholder engagement support.',
            ln: 'in/camilatapias'
        },
        {
            first_name: 'Benjamin',
            last_name:'Wallace',
            title: 'Mid-Level Planner',
            bio: 'I am driven by a desire to help people through authentic engagement and effective organizational management, so I enjoy developing solutions to complex social and environmental problems to improve the world.',
            education: ['University of Delaware: B.A., Sociology', 'University of Delaware: B.A., Philosophy', 'University of Delaware: M.S., Disaster Science and Management'],
            ask: ['Climate Change', 'EM Technology (e.g., GIS UAVs)', 'Hurricanes', 'Organizational Management/Leadership', 'Policy', 'New Zealand'],
            experience: 'After working in a state legislature, a public non-profit, and a center studying disabilities, he worked in emergency management consulting writing and editing plans for Ebola, nuclear terrorism, hurricanes, COVID-19, power outages, and nuclear power plants. He has published research on climate change and disaster management, and has certificates in leadership and professional development. At SPIN Global, Ben is an emergency management planner supporting federal and international client efforts.',
            ln: 'in/bendwallace'
        },
        {
            first_name: 'Brian',
            last_name: 'Kruzan',
            title: 'Senior Analyst',
            bio: 'After supporting data-driven projects in the transportation industry for over a decade, I was eager to join a team determined on reducing human suffering across the planet through innovative solutions.',
            education: ['Southern New Hampshire University, Public Administration'],
            ask: ['Project Management and Support', 'Administration', 'After Action Analysis', 'What music came out last Friday'],
            experience: 'Brian’s forte is program management and data analysis. For 10 years, he used these skills at FedEx where he led a corporate initiative to redesign loss and damage processes, and set corporate service goals, improving divisional operational compliance scores. Later, he followed his passion for people and served at Redemption Hill Church in Washington, DC full-time as an Assistant Pastor. These experiences shaped Brian’s “why” he now works at SPIN Global supporting local, state, federal clients in the homeland security and emergency management community.',
            ln: 'in/briankruzan'
        },
        {
            first_name: 'Dave',
            last_name: 'Wheeler',
            title: 'Logistics Planning Specialist',
            bio: 'I had the opportunity to be a part of a unique team that focused solely on domestic operations and service to the community and its leaders. I got to work, plan, train and serve alongside some of the most dedicated individuals and first responders at both the Federal and State levels.',
            education: ['Marshall University: Board of Regents BA'],
            ask: ['Operations Management', 'Training and Development', 'CBRNE', 'Cool places to visit on the Blue Ridge Parkway'],
            experience: 'Dave is a military veteran with over 15+ years of proven experience in the United States Army accomplishing measurable results while leading teams in a dynamic, fast-paced environment. He has a comprehensive background in Emergency Management with emphasis on Chemical, Biological Radiological, Nuclear and Explosive (CBRNE) operations, derived from conducting both domestic and global operations. He has conducted risk management across multiple lines to protect assets, property, and equipment and possesses extensive knowledge in operations management, exercise development, and human resource administration. He has conducted planning, training, and executed support for numerous disaster operations in support of State and Federal partners ranging from hurricanes, wildfires, snowstorms and man-made events.',
            ln: 'in/david-wheeler-sentinel'
        },
        {
            first_name: 'Morgan',
            last_name: 'Johnson',
            title: 'Emergency Management Specialist',
            bio: 'Since I was a kid picking up trash during my local beach cleanup day, I knew I wanted to go into a career field that allowed me to serve my community. With SPIN Global, not only am I in a position to help my neighbors - I am able to leverage my skills to help people all over the country and around the world manage the crises affecting them.',
            education: ['The College of William & Mary: B.S., Psychology', 'University of North Carolina at Chapel Hill: M.P.H., Health Behavior & Health Education'],
            ask: ['Emergency Management', 'Governmental Relations', 'Community Resilience', 'Public Health'],
            experience: 'Morgan began her career in emergency management with front line positions supporting hurricane response for the state of North Carolina and FEMA Region IV. For 17 years and counting, Morgan has applied her comprehensive emergency management experience - including a Master Exercise Practitioner certification - to roles at all levels of government. Since joining SPIN Global, Morgan\'s talents and subject matter expertise have been applied to multi-region planning and training efforts, national-level exercises, technology adoption, and strategic data modeling and analytics in the emergency management sphere.',
            ln: 'in/morganlynjohnson'
        },
        {
            first_name: 'Joel',
            last_name: 'Thomas',
            title: 'CEO',
            bio: 'Compassion is the reason why I do what I do. I have witnessed abject poverty and the devastating aftermath of disasters in many parts of the world. I\'ll never forget what I have observed and experienced, and hope to steward the opportunity I have been given and produce lasting fruit not just for today, but for generations to come.',
            education: ['Trinity International University: B.A., Business, Non-Profit Management', 'The George Washington University: M.A., Public Administration, International Development', 'Tulane University: Senior Fellow, Disaster Resilience Leadership Academy'],
            ask: ['Stories from 50+ Countries', 'Why we are a Public Benefit Corporation', 'Our "Olive Tree" Organizational Chart', 'Skating to where the puck is going to be'],
            experience: 'For the last twenty years, Joel has supported the design and implementation of local, national and multinational preparedness and risk reduction initiatives in 50+ countries and in 50 U.S. states and territories. His work is rooted in the experience of supporting response to hundreds of local and large scale disasters as a faith-based and humanitarian volunteer, an urban campus first responder in Washington D.C., and as a homeland security and emergency management professional who has participated in domestic and international response and recovery operations. He founded SPIN Global in 2015.',
            ln: 'in/joeldavidthomas'
        },
        {
            first_name: 'Alessandro',
            last_name: 'MacLaine',
            title: 'Lead Developer',
            bio: 'I\'ve been driven my whole life by a love for technology and a passion to improve the world. SPIN Global allows me combine these qualities everyday.',
            education: ['UC, Irvine: B.S., Mathematics for Quantitative Economics', 'UC, Irvine: B.S., Software Engineering'],
            ask: ['Technology', 'Digital Media', 'How to develop your organizations technology plan'],
            experience: 'After his first degree, Alessandro worked in finance in the Real Estate and Entertainment industries. Dissatisfied with calculating returns on investment and investor profits, he returned to UCI for a second degree in Software Engineering. Prior to SPIN Global, he worked on numerous open source and commercial projects and as a programming instructor at UCI\'s Coding Bootcamp. He now leads development and support for www.PlanetReady.com, which is SPIN Global’s online disaster risk reduction and preparedness platform designed to make the world safer.',
            ln: 'in/almaclaine'
        },
        {
            first_name: "Sara",
            last_name: "Homan",
            title: "Senior Emergency Management Planner",
            bio: "Disrupting disasters by building coordination and partnerships through planning is the reason that choose to work in Emergency Management and found my place with SPIN Global.",
            education: ['M.S., Psychology, Grand Canyon University 2015', 'M.A., Political Studies, National Security and Terrorism, University of Illinois 2004', 'B.A., Political Studies, University of Illinois 2003'],
            ask: ['Catastrophic Earthquake Response and Recovery', 'Community Outreach', 'State and Local Collaboration', 'Gap Analyses', 'High end designs with thrift store finds!'],
            experience: "In the past 15 years, Sara has had the opportunity to work in Emergency Management planning from the local to federal levels in multiple states and three FEMA regions. She has spent the majority of her EM career focused on Catastrophic Earthquake Response and Recovery planning and in 2018 completed the Joint State of Missouri & Region 7 New Madrid Seismic Zone Earthquake – Interagency Operations Plan which is the only joint plan of its kind. Creating lasting relationships between FEMA and its stakeholders and building trust has been at the forefront of all Sara’s planning efforts.",
            ln: 'in/sara-ann-homan-3b909a8'
        }
    ];

    /* src/components/Modal.svelte generated by Svelte v3.31.2 */

    const file$5 = "src/components/Modal.svelte";

    // (6:0) {#if open}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "modal fixed w-v100 flex-col--cc svelte-q0yuk1");
    			add_location(div, file$5, 6, 4, 97);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					self$1(function () {
    						if (is_function(/*close*/ ctx[1])) /*close*/ ctx[1].apply(this, arguments);
    					}),
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(6:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { open = false } = $$props;

    	let { close = () => {
    		
    	} } = $$props;

    	const writable_props = ["open", "close"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("close" in $$props) $$invalidate(1, close = $$props.close);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ open, close });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("close" in $$props) $$invalidate(1, close = $$props.close);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, close, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { open: 0, close: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MemberCard.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$6 = "src/components/MemberCard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (33:12) {#each education as edu}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*edu*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "font_text-primary svelte-cago6v");
    			add_location(li, file$6, 33, 16, 1031);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*education*/ 64 && t_value !== (t_value = /*edu*/ ctx[16] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(33:12) {#each education as edu}",
    		ctx
    	});

    	return block;
    }

    // (47:12) {#each ask as edu}
    function create_each_block$2(ctx) {
    	let li;
    	let t_value = /*edu*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "font_text-primary svelte-cago6v");
    			add_location(li, file$6, 47, 16, 1460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ask*/ 32 && t_value !== (t_value = /*edu*/ ctx[16] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(47:12) {#each ask as edu}",
    		ctx
    	});

    	return block;
    }

    // (26:0) <Modal open={open} close={() => open = false}>
    function create_default_slot$2(ctx) {
    	let div1;
    	let h20;
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let h21;
    	let t8;
    	let ul0;
    	let t9;
    	let h22;
    	let t11;
    	let div0;
    	let p1;
    	let t12;
    	let t13;
    	let h23;
    	let t15;
    	let ul1;
    	let each_value_1 = /*education*/ ctx[6];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*ask*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h20 = element("h2");
    			t0 = text(/*first_name*/ ctx[0]);
    			t1 = text("'s \"Why\"");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("\"");
    			t4 = text(/*bio*/ ctx[3]);
    			t5 = text("\"");
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "Education";
    			t8 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			h22 = element("h2");
    			h22.textContent = "Past Experience";
    			t11 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t12 = text(/*experience*/ ctx[4]);
    			t13 = space();
    			h23 = element("h2");
    			h23.textContent = "Ask Me About";
    			t15 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "font_header-secondary text-center");
    			add_location(h20, file$6, 27, 8, 745);
    			attr_dev(p0, "class", "font_text-primary text-center m-l2 svelte-cago6v");
    			add_location(p0, file$6, 28, 8, 825);
    			attr_dev(h21, "class", "font_header-secondary text-left");
    			add_location(h21, file$6, 29, 8, 891);
    			attr_dev(ul0, "class", "ml-l2");
    			add_location(ul0, file$6, 31, 8, 959);
    			attr_dev(h22, "class", "font_header-secondary mt-l1 text-left");
    			add_location(h22, file$6, 37, 8, 1115);
    			attr_dev(p1, "class", "font_text-primary svelte-cago6v");
    			add_location(p1, file$6, 39, 12, 1226);
    			attr_dev(div0, "class", "ml-l2");
    			add_location(div0, file$6, 38, 8, 1194);
    			attr_dev(h23, "class", "font_header-secondary mt-l1 text-left");
    			add_location(h23, file$6, 42, 8, 1296);
    			attr_dev(ul1, "class", "ml-l2");
    			add_location(ul1, file$6, 45, 8, 1394);
    			attr_dev(div1, "class", "big-bio of-auto br-px8 w-max-v80 w-p100 m-l4 p-l4 svelte-cago6v");
    			add_location(div1, file$6, 26, 4, 673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, h21);
    			append_dev(div1, t8);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div1, t9);
    			append_dev(div1, h22);
    			append_dev(div1, t11);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t12);
    			append_dev(div1, t13);
    			append_dev(div1, h23);
    			append_dev(div1, t15);
    			append_dev(div1, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*first_name*/ 1) set_data_dev(t0, /*first_name*/ ctx[0]);
    			if (dirty & /*bio*/ 8) set_data_dev(t4, /*bio*/ ctx[3]);

    			if (dirty & /*education*/ 64) {
    				each_value_1 = /*education*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*experience*/ 16) set_data_dev(t12, /*experience*/ ctx[4]);

    			if (dirty & /*ask*/ 32) {
    				each_value = /*ask*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(26:0) <Modal open={open} close={() => open = false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let modal;
    	let t0;
    	let div2;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let h20;
    	let t2;
    	let t3;
    	let h21;
    	let t4;
    	let t5;
    	let p0;
    	let t6;
    	let t7;
    	let div0;
    	let a;
    	let p1;
    	let t9;
    	let p2;
    	let t11;
    	let p3;
    	let current;
    	let mounted;
    	let dispose;

    	modal = new Modal({
    			props: {
    				open: /*open*/ ctx[7],
    				close: /*func*/ ctx[12],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			t2 = text(/*first_name*/ ctx[0]);
    			t3 = space();
    			h21 = element("h2");
    			t4 = text(/*last_name*/ ctx[1]);
    			t5 = space();
    			p0 = element("p");
    			t6 = text(/*title*/ ctx[2]);
    			t7 = space();
    			div0 = element("div");
    			a = element("a");
    			p1 = element("p");
    			p1.textContent = "LinkedIn";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "|";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "Bio";
    			attr_dev(img, "class", "us-none svelte-cago6v");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[9]);
    			add_location(img, file$6, 54, 4, 1624);
    			attr_dev(h20, "class", "font_header-secondary");
    			add_location(h20, file$6, 56, 8, 1712);
    			attr_dev(h21, "class", "font_header-secondary");
    			add_location(h21, file$6, 57, 8, 1772);
    			attr_dev(p0, "class", "font_text-primary text-center w-max-p90 svelte-cago6v");
    			add_location(p0, file$6, 58, 8, 1831);
    			attr_dev(p1, "class", "font_text-primary text-center inline ln svelte-cago6v");
    			add_location(p1, file$6, 61, 16, 1990);
    			attr_dev(a, "href", /*linkedinUrl*/ ctx[10]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 60, 12, 1935);
    			attr_dev(p2, "class", "font_text-primary text-center inline svelte-cago6v");
    			add_location(p2, file$6, 63, 12, 2083);
    			attr_dev(p3, "class", "font_text-primary bio inline svelte-cago6v");
    			add_location(p3, file$6, 64, 12, 2149);
    			attr_dev(div0, "class", "m-auto");
    			add_location(div0, file$6, 59, 8, 1902);
    			attr_dev(div1, "class", "flex-col--tc");
    			add_location(div1, file$6, 55, 4, 1677);
    			attr_dev(div2, "class", "member-surface of-hidden br-px8 m-l3 flex-col--tc svelte-cago6v");
    			add_location(div2, file$6, 53, 0, 1556);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(h20, t2);
    			append_dev(div1, t3);
    			append_dev(div1, h21);
    			append_dev(h21, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p0);
    			append_dev(p0, t6);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, p1);
    			append_dev(div0, t9);
    			append_dev(div0, p2);
    			append_dev(div0, t11);
    			append_dev(div0, p3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(p3, "click", /*click_handler*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*open*/ 128) modal_changes.open = /*open*/ ctx[7];
    			if (dirty & /*open*/ 128) modal_changes.close = /*func*/ ctx[12];

    			if (dirty & /*$$scope, ask, experience, education, bio, first_name*/ 2097273) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);

    			if (!current || dirty & /*imgSrc*/ 256 && img.src !== (img_src_value = /*imgSrc*/ ctx[8])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*imgAlt*/ 512) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[9]);
    			}

    			if (!current || dirty & /*first_name*/ 1) set_data_dev(t2, /*first_name*/ ctx[0]);
    			if (!current || dirty & /*last_name*/ 2) set_data_dev(t4, /*last_name*/ ctx[1]);
    			if (!current || dirty & /*title*/ 4) set_data_dev(t6, /*title*/ ctx[2]);

    			if (!current || dirty & /*linkedinUrl*/ 1024) {
    				attr_dev(a, "href", /*linkedinUrl*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let imgSrc;
    	let imgAlt;
    	let linkedinUrl;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MemberCard", slots, []);
    	let { first_name = "" } = $$props;
    	let { last_name = "" } = $$props;
    	let { title = "" } = $$props;
    	let { bio = "" } = $$props;
    	let { experience = "" } = $$props;
    	let { ask = [] } = $$props;
    	let { education = [] } = $$props;
    	let { ln = "" } = $$props;
    	let display = "hide";
    	let open = false;

    	function handler() {
    		console.log(open);
    		$$invalidate(7, open = true);
    		console.log(open);
    	}

    	const writable_props = [
    		"first_name",
    		"last_name",
    		"title",
    		"bio",
    		"experience",
    		"ask",
    		"education",
    		"ln"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<MemberCard> was created with unknown prop '${key}'`);
    	});

    	const func = () => $$invalidate(7, open = false);
    	const click_handler = () => $$invalidate(7, open = true);

    	$$self.$$set = $$props => {
    		if ("first_name" in $$props) $$invalidate(0, first_name = $$props.first_name);
    		if ("last_name" in $$props) $$invalidate(1, last_name = $$props.last_name);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("bio" in $$props) $$invalidate(3, bio = $$props.bio);
    		if ("experience" in $$props) $$invalidate(4, experience = $$props.experience);
    		if ("ask" in $$props) $$invalidate(5, ask = $$props.ask);
    		if ("education" in $$props) $$invalidate(6, education = $$props.education);
    		if ("ln" in $$props) $$invalidate(11, ln = $$props.ln);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		first_name,
    		last_name,
    		title,
    		bio,
    		experience,
    		ask,
    		education,
    		ln,
    		display,
    		open,
    		handler,
    		imgSrc,
    		imgAlt,
    		linkedinUrl
    	});

    	$$self.$inject_state = $$props => {
    		if ("first_name" in $$props) $$invalidate(0, first_name = $$props.first_name);
    		if ("last_name" in $$props) $$invalidate(1, last_name = $$props.last_name);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("bio" in $$props) $$invalidate(3, bio = $$props.bio);
    		if ("experience" in $$props) $$invalidate(4, experience = $$props.experience);
    		if ("ask" in $$props) $$invalidate(5, ask = $$props.ask);
    		if ("education" in $$props) $$invalidate(6, education = $$props.education);
    		if ("ln" in $$props) $$invalidate(11, ln = $$props.ln);
    		if ("display" in $$props) display = $$props.display;
    		if ("open" in $$props) $$invalidate(7, open = $$props.open);
    		if ("imgSrc" in $$props) $$invalidate(8, imgSrc = $$props.imgSrc);
    		if ("imgAlt" in $$props) $$invalidate(9, imgAlt = $$props.imgAlt);
    		if ("linkedinUrl" in $$props) $$invalidate(10, linkedinUrl = $$props.linkedinUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*first_name*/ 1) {
    			 $$invalidate(8, imgSrc = `./profiles/${first_name.toLowerCase()}.png`);
    		}

    		if ($$self.$$.dirty & /*first_name, last_name*/ 3) {
    			 $$invalidate(9, imgAlt = `${first_name} ${last_name} profile image.`);
    		}

    		if ($$self.$$.dirty & /*ln*/ 2048) {
    			 $$invalidate(10, linkedinUrl = `https://www.linkedin.com/${ln}`);
    		}
    	};

    	return [
    		first_name,
    		last_name,
    		title,
    		bio,
    		experience,
    		ask,
    		education,
    		open,
    		imgSrc,
    		imgAlt,
    		linkedinUrl,
    		ln,
    		func,
    		click_handler
    	];
    }

    class MemberCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			first_name: 0,
    			last_name: 1,
    			title: 2,
    			bio: 3,
    			experience: 4,
    			ask: 5,
    			education: 6,
    			ln: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MemberCard",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get first_name() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first_name(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last_name() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last_name(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bio() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bio(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get experience() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set experience(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ask() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ask(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get education() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set education(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ln() {
    		throw new Error("<MemberCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ln(value) {
    		throw new Error("<MemberCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Team.svelte generated by Svelte v3.31.2 */
    const file$7 = "src/pages/Team.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (27:8) {#each teamMembers.sort(sorter) as member}
    function create_each_block$3(ctx) {
    	let membercard;
    	let current;
    	const membercard_spread_levels = [/*member*/ ctx[1]];
    	let membercard_props = {};

    	for (let i = 0; i < membercard_spread_levels.length; i += 1) {
    		membercard_props = assign(membercard_props, membercard_spread_levels[i]);
    	}

    	membercard = new MemberCard({ props: membercard_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(membercard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(membercard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const membercard_changes = (dirty & /*teamMembers, sorter*/ 0)
    			? get_spread_update(membercard_spread_levels, [get_spread_object(/*member*/ ctx[1])])
    			: {};

    			membercard.$set(membercard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(membercard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(membercard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(membercard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(27:8) {#each teamMembers.sort(sorter) as member}",
    		ctx
    	});

    	return block;
    }

    // (23:0) <Page {...pageInfo}>
    function create_default_slot$3(ctx) {
    	let p;
    	let t0;
    	let a0;
    	let t2;
    	let a1;
    	let t4;
    	let div0;
    	let t5;
    	let div1;
    	let current;
    	let each_value = TeamMembers.sort(sorter);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Work with us! Search openings ");
    			a0 = element("a");
    			a0.textContent = "here";
    			t2 = text(" or send resume and cover letter to ");
    			a1 = element("a");
    			a1.textContent = "careers@spinglobal.org.";
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div1 = element("div");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://www.indeedjobs.com/spin-global?hl=en_US");
    			add_location(a0, file$7, 23, 86, 715);
    			attr_dev(a1, "href", "mailto:careers@spinglobal.org");
    			add_location(a1, file$7, 23, 204, 833);
    			attr_dev(p, "class", "font_text-primary text-center mt-l3 p-l0");
    			add_location(p, file$7, 23, 4, 633);
    			attr_dev(div0, "class", "team-surface w-max-n1 m-auto flex--wrap flex-row--tc");
    			add_location(div0, file$7, 25, 4, 910);
    			attr_dev(div1, "class", "mb-l3");
    			add_location(div1, file$7, 30, 4, 1097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a0);
    			append_dev(p, t2);
    			append_dev(p, a1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamMembers, sorter*/ 0) {
    				each_value = TeamMembers.sort(sorter);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(23:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[0]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 1)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 16) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sorter(a, b) {
    	if (a.last_name < b.last_name) {
    		return -1;
    	}

    	if (a.last_name > b.last_name) {
    		return 1;
    	}

    	return 0;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Team", slots, []);

    	const pageInfo = {
    		headerText: "Our Team",
    		text: "We are compassionate people working together for a higher purpose, seeking to create value for clients and humanity with a spirit of excellence."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Page,
    		teamMembers: TeamMembers,
    		MemberCard,
    		sorter,
    		pageInfo
    	});

    	return [pageInfo];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.31.2 */

    const file$8 = "src/components/Footer.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1;
    	let a0;
    	let t3;
    	let p1;
    	let t4;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let p2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text("Contact us for more information at ");
    			a0 = element("a");
    			a0.textContent = "info@spinglobal.org";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Work with us! Search openings ");
    			a1 = element("a");
    			a1.textContent = "here";
    			t6 = text(" or send resume and cover letter to ");
    			a2 = element("a");
    			a2.textContent = "careers@spinglobal.org.";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Copyright © 2021 SPIN Global. All Rights Reserved.";
    			if (img.src !== (img_src_value = "./gsa_holder.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "GSA contract");
    			attr_dev(img, "class", "svelte-1f0bqzk");
    			add_location(img, file$8, 4, 4, 63);
    			attr_dev(a0, "href", "mailto:info@spinglobal.org");
    			attr_dev(a0, "class", "svelte-1f0bqzk");
    			add_location(a0, file$8, 5, 80, 191);
    			attr_dev(p0, "class", "font_text-primary text-center");
    			add_location(p0, file$8, 5, 4, 115);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://www.indeedjobs.com/spin-global?hl=en_US");
    			attr_dev(a1, "class", "svelte-1f0bqzk");
    			add_location(a1, file$8, 6, 81, 337);
    			attr_dev(a2, "href", "mailto:careers@spinglobal.org");
    			attr_dev(a2, "class", "svelte-1f0bqzk");
    			add_location(a2, file$8, 6, 199, 455);
    			attr_dev(p1, "class", "font_text-primary text-center mt-l1");
    			add_location(p1, file$8, 6, 4, 260);
    			attr_dev(p2, "class", "font_text-primary text-center grey mt-l1");
    			add_location(p2, file$8, 7, 4, 531);
    			attr_dev(div, "class", "flex-col--tc border m-l0 svelte-1f0bqzk");
    			add_location(div, file$8, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p0);
    			append_dev(p0, t1);
    			append_dev(p0, a0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a1);
    			append_dev(p1, t6);
    			append_dev(p1, a2);
    			append_dev(div, t8);
    			append_dev(div, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/ImpactMap.svelte generated by Svelte v3.31.2 */

    const file$9 = "src/components/ImpactMap.svelte";

    function create_fragment$9(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "500");
    			attr_dev(iframe, "height", "400");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "scrolling", "no");
    			attr_dev(iframe, "title", "SPIN Global Client Engagement Polygons");
    			if (iframe.src !== (iframe_src_value = "//www.arcgis.com/apps/Embed/index.html?webmap=224b6f12f80746d480282da15ae845d7&extent=-180,-68.4638,180,86.2326&zoom=true&previewImage=false&scale=true&disable_scroll=true&theme=light&level=3")) attr_dev(iframe, "src", iframe_src_value);
    			add_location(iframe, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ImpactMap", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImpactMap> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ImpactMap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImpactMap",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/pages/Impact.svelte generated by Svelte v3.31.2 */
    const file$a = "src/pages/Impact.svelte";

    // (12:0) <Page {...pageInfo}>
    function create_default_slot$4(ctx) {
    	let div;
    	let impactmap;
    	let current;
    	impactmap = new ImpactMap({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(impactmap.$$.fragment);
    			attr_dev(div, "class", "embed-container mt-l1 w-p100");
    			add_location(div, file$a, 12, 4, 334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(impactmap, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(impactmap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(impactmap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(impactmap);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(12:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[0]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 1)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Impact", slots, []);

    	const pageInfo = {
    		headerText: "Our Impact",
    		text: "Click on the shaded areas on the map below to explore our projects in neighborhoods and nations."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Impact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, ImpactMap, pageInfo });
    	return [pageInfo];
    }

    class Impact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Impact",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const ClientsList = [
        //
        {
            name: 'DHS',
            src: 'dhs.png'
        },
        {
            name: 'Dun & Bradstreet',
            src: 'dnb.webp'
        },
        {
            name: 'Port Authority NY/NJ',
            src: 'port_authority_ny.jpg'
        },
        {
            name: 'ISG',
            src: 'isg.png'
        },
        //
        {
            name: 'City of Fairfax',
            src: 'city_of_fairfax.png'
        },
        {
            name: 'World Bank',
            src: 'world_bank.png'
        },
        {
            name: 'New York City Office of Emergency Management',
            src: 'nycem.jpg'
        },
        {
            name: 'BCFS',
            src: 'bcfs.png'
        },
        //
        {
            name: 'Morris County Office of Emergency Management',
            src: 'morris_county.png'
        },
        {
            name: 'District of Columbia Homeland Security and Emergency Management Agency',
            src: 'hsema.png'
        },
        {
            name: 'NATO',
            src: 'nato.png'
        },
        {
            name: 'MWCG',
            src: 'mwcg.png'
        },
        //
        {
            name: 'Single Automated Business Emergency Response (SABER)',
            src: 'saber.png'
        },
        {
            name: 'Salem Academy Charter School',
            src: 'salem.png'
        },
        {
            name: 'Maryland Department of Commerce',
            src: 'maryland.jpg'
        },
        {
            name: 'Prince William County',
            src: 'pwc.png'
        },
        //
        {
            name: 'DOD',
            src: 'dodsg.png'
        },
        {
            name: 'Saint Clair County',
            src: 'saint_clair_county.gif'
        },
        {
            name: 'EIS',
            src: 'eis.jpg'
        },
        {
            name: 'NISC',
            src: 'nisc.jpg'
        },
        {
            name: 'Oregon Department of Administration Services',
            src: 'oregon.png'
        }
    ];

    /* src/pages/Clients.svelte generated by Svelte v3.31.2 */
    const file$b = "src/pages/Clients.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:8) {#each clientList as client}
    function create_each_block$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", "client-logo");
    			if (img.src !== (img_src_value = `clients/${/*client*/ ctx[1].src}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "client us-none m-l2 svelte-1t95wul");
    			add_location(img, file$b, 13, 12, 529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(13:8) {#each clientList as client}",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Page {...pageInfo}>
    function create_default_slot$5(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let each_value = ClientsList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "flex-row--tc w-max-n1 m-auto flex--wrap");
    			add_location(div0, file$b, 11, 4, 426);
    			attr_dev(div1, "class", "mb-l3");
    			add_location(div1, file$b, 16, 4, 642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clientList*/ 0) {
    				each_value = ClientsList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(11:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[0]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 1)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 16) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clients", slots, []);

    	const pageInfo = {
    		headerText: "Our Clientele",
    		text: "We serve Individuals & Families, Non-Governmental Organizations, Fortune 500 companies, Local, State and National Governments, Defense Organizations, and Multilateral Institutions around the world."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clients> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, clientList: ClientsList, pageInfo });
    	return [pageInfo];
    }

    class Clients extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clients",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/SocialIcon.svelte generated by Svelte v3.31.2 */

    const file$c = "src/components/SocialIcon.svelte";

    function create_fragment$c(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "social svelte-1h2pfee");
    			attr_dev(img, "alt", "social icon");
    			if (img.src !== (img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$c, 6, 4, 107);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", /*link*/ ctx[0]);
    			add_location(a, file$c, 5, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 2 && img.src !== (img_src_value = /*src*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*link*/ 1) {
    				attr_dev(a, "href", /*link*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SocialIcon", slots, []);
    	let { link = "" } = $$props;
    	let { src = "" } = $$props;
    	const writable_props = ["link", "src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SocialIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({ link, src });

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, src];
    }

    class SocialIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { link: 0, src: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialIcon",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get link() {
    		throw new Error("<SocialIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<SocialIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<SocialIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<SocialIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SocialIcons.svelte generated by Svelte v3.31.2 */
    const file$d = "src/components/SocialIcons.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let socialicon0;
    	let t0;
    	let socialicon1;
    	let t1;
    	let socialicon2;
    	let t2;
    	let socialicon3;
    	let t3;
    	let socialicon4;
    	let current;

    	socialicon0 = new SocialIcon({
    			props: {
    				link: "https://www.linkedin.com/company/spinglobal1",
    				src: "linkedin.png"
    			},
    			$$inline: true
    		});

    	socialicon1 = new SocialIcon({
    			props: {
    				link: "https://www.youtube.com/channel/UCBVfkDr5ANXQWSDZQi2ZpOg",
    				src: "utube.png"
    			},
    			$$inline: true
    		});

    	socialicon2 = new SocialIcon({
    			props: {
    				link: "https://www.instagram.com/planet_ready",
    				src: "insta.webp"
    			},
    			$$inline: true
    		});

    	socialicon3 = new SocialIcon({
    			props: {
    				link: "https://twitter.com/spin_global",
    				src: "twitter.png"
    			},
    			$$inline: true
    		});

    	socialicon4 = new SocialIcon({
    			props: {
    				link: "mailto:info@spinglobal.org",
    				src: "mail.png"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(socialicon0.$$.fragment);
    			t0 = space();
    			create_component(socialicon1.$$.fragment);
    			t1 = space();
    			create_component(socialicon2.$$.fragment);
    			t2 = space();
    			create_component(socialicon3.$$.fragment);
    			t3 = space();
    			create_component(socialicon4.$$.fragment);
    			attr_dev(div, "class", "flex-row--cc");
    			add_location(div, file$d, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(socialicon0, div, null);
    			append_dev(div, t0);
    			mount_component(socialicon1, div, null);
    			append_dev(div, t1);
    			mount_component(socialicon2, div, null);
    			append_dev(div, t2);
    			mount_component(socialicon3, div, null);
    			append_dev(div, t3);
    			mount_component(socialicon4, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(socialicon0.$$.fragment, local);
    			transition_in(socialicon1.$$.fragment, local);
    			transition_in(socialicon2.$$.fragment, local);
    			transition_in(socialicon3.$$.fragment, local);
    			transition_in(socialicon4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(socialicon0.$$.fragment, local);
    			transition_out(socialicon1.$$.fragment, local);
    			transition_out(socialicon2.$$.fragment, local);
    			transition_out(socialicon3.$$.fragment, local);
    			transition_out(socialicon4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(socialicon0);
    			destroy_component(socialicon1);
    			destroy_component(socialicon2);
    			destroy_component(socialicon3);
    			destroy_component(socialicon4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SocialIcons", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SocialIcons> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SocialIcon });
    	return [];
    }

    class SocialIcons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialIcons",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/TopBar.svelte generated by Svelte v3.31.2 */
    const file$e = "src/components/TopBar.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].link;
    	child_ctx[7] = list[i].title;
    	return child_ctx;
    }

    // (65:4) {#if mediaManager.active >= mediaManager.breaks[3] || open}
    function create_if_block_1(ctx) {
    	let div;
    	let div_class_value;
    	let t;
    	let socialicons;
    	let current;
    	let each_value = /*links*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	socialicons = new SocialIcons({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(socialicons.$$.fragment);
    			attr_dev(div, "class", div_class_value = "m-auto w-p100 pl-n1 pr-n1 " + /*linkFlex*/ ctx[2] + " flex--space-around" + " svelte-1e4d6im");
    			add_location(div, file$e, 65, 8, 1726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(socialicons, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 8) {
    				each_value = /*links*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*linkFlex*/ 4 && div_class_value !== (div_class_value = "m-auto w-p100 pl-n1 pr-n1 " + /*linkFlex*/ ctx[2] + " flex--space-around" + " svelte-1e4d6im")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(socialicons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(socialicons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(socialicons, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(65:4) {#if mediaManager.active >= mediaManager.breaks[3] || open}",
    		ctx
    	});

    	return block;
    }

    // (67:12) {#each links as {link, title}}
    function create_each_block$5(ctx) {
    	let a;
    	let h2;
    	let t0_value = /*title*/ ctx[7] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			a = element("a");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(h2, "class", "font_header-tertiary svelte-1e4d6im");
    			add_location(h2, file$e, 68, 20, 1894);
    			attr_dev(a, "href", "#" + /*link*/ ctx[6]);
    			add_location(a, file$e, 67, 16, 1855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, h2);
    			append_dev(h2, t0);
    			append_dev(a, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(67:12) {#each links as {link, title}}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#if mediaManager.active < mediaManager.breaks[3] && !open}
    function create_if_block$3(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "avatar svelte-1e4d6im");
    			if (img.src !== (img_src_value = "./hamburger.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			add_location(img, file$e, 78, 30, 2200);
    			attr_dev(a, "href", "#/login");
    			add_location(a, file$e, 78, 12, 2182);
    			attr_dev(div, "class", "button-surface absolute svelte-1e4d6im");
    			add_location(div, file$e, 77, 8, 2103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(77:4) {#if mediaManager.active < mediaManager.breaks[3] && !open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let div1_class_value;
    	let current;
    	let if_block0 = (mediaManager.active >= mediaManager.breaks[3] || /*open*/ ctx[0]) && create_if_block_1(ctx);
    	let if_block1 = mediaManager.active < mediaManager.breaks[3] && !/*open*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(img, "class", "pt-n3 svelte-1e4d6im");
    			if (img.src !== (img_src_value = "./spin_logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SPIN Logo");
    			add_location(img, file$e, 61, 24, 1580);
    			attr_dev(a, "href", "#home");
    			add_location(a, file$e, 61, 8, 1564);
    			attr_dev(div0, "class", "m-l0");
    			add_location(div0, file$e, 60, 4, 1537);
    			attr_dev(div1, "class", div1_class_value = "top-bar-surface sticky " + /*barFlex*/ ctx[1] + " flex--space-between" + " svelte-1e4d6im");
    			add_location(div1, file$e, 59, 0, 1466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (mediaManager.active >= mediaManager.breaks[3] || /*open*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (mediaManager.active < mediaManager.breaks[3] && !/*open*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*barFlex*/ 2 && div1_class_value !== (div1_class_value = "top-bar-surface sticky " + /*barFlex*/ ctx[1] + " flex--space-between" + " svelte-1e4d6im")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TopBar", slots, []);
    	let open = false;
    	let barFlex;
    	let linkFlex;
    	determineDynamicStyles();

    	onMount(() => {
    		const body = document.getElementsByTagName("body")[0];

    		body.addEventListener(
    			"click",
    			e => {
    				if (e.target === e.currentTarget) {
    					e.stopPropagation();
    				}

    				$$invalidate(0, open = false);
    			},
    			true
    		);
    	});

    	function determineDynamicStyles() {
    		const breaks = mediaManager.breaks;

    		$$invalidate(1, barFlex = mediaManager.active <= breaks[3]
    		? "flex-col--cc"
    		: "flex-row--cc");

    		$$invalidate(2, linkFlex = mediaManager.active <= breaks[2]
    		? "flex-col--cc"
    		: "flex-row--cc flex--space-between");
    	}

    	mediaManager.addEventListener("change", () => {
    		determineDynamicStyles();
    	});

    	const links = [
    		{
    			title: "Why We Exist",
    			link: "why_we_exist"
    		},
    		{
    			title: "Capabilities",
    			link: "featured_capabilities"
    		},
    		{
    			title: "Platforms",
    			link: "our_platforms"
    		},
    		{ title: "Team", link: "our_team" },
    		{ title: "Impact", link: "our_impact" },
    		{
    			title: "Clientele",
    			link: "our_clientele"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, open = true);

    	$$self.$capture_state = () => ({
    		mediaManager,
    		onMount,
    		SocialIcons,
    		open,
    		barFlex,
    		linkFlex,
    		determineDynamicStyles,
    		links
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("barFlex" in $$props) $$invalidate(1, barFlex = $$props.barFlex);
    		if ("linkFlex" in $$props) $$invalidate(2, linkFlex = $$props.linkFlex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, barFlex, linkFlex, links, click_handler];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/SPINVideo.svelte generated by Svelte v3.31.2 */

    const file$f = "src/components/SPINVideo.svelte";

    function create_fragment$f(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "SPIN Video");
    			attr_dev(iframe, "class", "br-px8 m-l3");
    			set_style(iframe, "box-shadow", "16px 16px 16px rgba(0,0,0,.5)");
    			set_style(iframe, "max-width", "900px");
    			set_style(iframe, "width", "100%");
    			attr_dev(iframe, "height", "500");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/2Urhj6KeINQ")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SPINVideo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SPINVideo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SPINVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SPINVideo",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/pages/Exist.svelte generated by Svelte v3.31.2 */
    const file$g = "src/pages/Exist.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (51:12) {#each missionStatements as statement}
    function create_each_block$6(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*statement*/ ctx[3].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*statement*/ ctx[3].text + "";
    	let t3;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = text(".");
    			t5 = space();
    			attr_dev(h2, "class", "font_header-secondary inline");
    			add_location(h2, file$g, 52, 20, 2135);
    			attr_dev(p, "class", "font_text-primary inline");
    			add_location(p, file$g, 53, 20, 2220);
    			attr_dev(div, "class", "w-max-n1 m-n1");
    			add_location(div, file$g, 51, 16, 2087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(div, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(51:12) {#each missionStatements as statement}",
    		ctx
    	});

    	return block;
    }

    // (37:0) <Page {...pageInfo}>
    function create_default_slot$6(ctx) {
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let spinvideo;
    	let t4;
    	let h21;
    	let t6;
    	let p1;
    	let a;
    	let t8;
    	let div1;
    	let t9;
    	let div3;
    	let current;
    	spinvideo = new SPINVideo({ $$inline: true });
    	let each_value = /*missionStatements*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "SPIN Global";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "is a public benefit corporation that exists to disrupt disasters from neighborhoods to nations. We are motivated by compassion to reduce physical, social, and economic suffering caused by disasters.";
    			t3 = space();
    			create_component(spinvideo.$$.fragment);
    			t4 = space();
    			h21 = element("h2");
    			h21.textContent = "Our approach is built on four key pillars.";
    			t6 = space();
    			p1 = element("p");
    			a = element("a");
    			a.textContent = "Learn More.";
    			t8 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div3 = element("div");
    			attr_dev(h20, "class", "font_header-secondary inline");
    			add_location(h20, file$g, 39, 12, 1351);
    			attr_dev(p0, "class", "font_text-primary inline");
    			add_location(p0, file$g, 40, 12, 1421);
    			attr_dev(div0, "class", "text-center w-max-n2 mt-l0");
    			add_location(div0, file$g, 38, 8, 1298);
    			attr_dev(h21, "class", "font_header-secondary inline");
    			add_location(h21, file$g, 43, 8, 1704);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", "/capabilities/Master_Capabilities.pdf");
    			add_location(a, file$g, 45, 12, 1850);
    			attr_dev(p1, "class", "font_text-primary inline");
    			add_location(p1, file$g, 44, 8, 1801);
    			attr_dev(div1, "class", "flex-col--tl pl-l3 pr-l3");
    			add_location(div1, file$g, 49, 8, 1981);
    			attr_dev(div2, "class", "flex-col--tc");
    			add_location(div2, file$g, 37, 4, 1263);
    			attr_dev(div3, "class", "mb-l3");
    			add_location(div3, file$g, 58, 4, 2351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			mount_component(spinvideo, div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, h21);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(p1, a);
    			append_dev(div2, t8);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*missionStatements*/ 2) {
    				each_value = /*missionStatements*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinvideo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinvideo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(spinvideo);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(37:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[0]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < page_spread_levels.length; i += 1) {
    		page_props = assign(page_props, page_spread_levels[i]);
    	}

    	page = new Page({ props: page_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = (dirty & /*pageInfo*/ 1)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 64) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Exist", slots, []);

    	let width = mediaManager.active < mediaManager.breaks[5]
    	? "80%"
    	: "50%";

    	mediaManager.addEventListener("change", () => {
    		width = mediaManager.active < mediaManager.breaks[5]
    		? "80%"
    		: "50%";
    	});

    	const pageInfo = { headerText: "Why We Exist", text: "" };

    	const missionStatements = [
    		{
    			title: "Strategic Planning",
    			text: "We provide our clients comprehensive expertise, guidance, and decision support solutions"
    		},
    		{
    			title: "Partnerships",
    			text: "We prioritize inclusion of private, non-governmental and public sectors, and traditionally underrepresented groups."
    		},
    		{
    			title: "Innovation for Impact",
    			text: "We combine operations, research, and technology with science, data, and “last mile” user needs"
    		},
    		{
    			title: "Neighborhoods and Nations",
    			text: "Our solutions are sensitized to reflect the operating environment at any scale"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Exist> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Page,
    		mediaManager,
    		SPINVideo,
    		width,
    		pageInfo,
    		missionStatements
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) width = $$props.width;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pageInfo, missionStatements];
    }

    class Exist extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Exist",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file$h = "src/App.svelte";

    function create_fragment$h(ctx) {
    	let main;
    	let div;
    	let t0;
    	let topbar;
    	let t1;
    	let parallaxscreen;
    	let t2;
    	let mission;
    	let t3;
    	let testimonial0;
    	let t4;
    	let capabilities;
    	let t5;
    	let testimonial1;
    	let t6;
    	let platforms;
    	let t7;
    	let testimonial2;
    	let t8;
    	let team;
    	let t9;
    	let testimonial3;
    	let t10;
    	let work;
    	let t11;
    	let testimonial4;
    	let t12;
    	let clients;
    	let t13;
    	let footer;
    	let current;
    	topbar = new TopBar({ $$inline: true });
    	parallaxscreen = new Splash({ $$inline: true });
    	mission = new Exist({ $$inline: true });
    	const testimonial0_spread_levels = [TESTIMONIALS[0]];
    	let testimonial0_props = {};

    	for (let i = 0; i < testimonial0_spread_levels.length; i += 1) {
    		testimonial0_props = assign(testimonial0_props, testimonial0_spread_levels[i]);
    	}

    	testimonial0 = new Testimonial({
    			props: testimonial0_props,
    			$$inline: true
    		});

    	capabilities = new Capabilities({ $$inline: true });
    	const testimonial1_spread_levels = [TESTIMONIALS[1]];
    	let testimonial1_props = {};

    	for (let i = 0; i < testimonial1_spread_levels.length; i += 1) {
    		testimonial1_props = assign(testimonial1_props, testimonial1_spread_levels[i]);
    	}

    	testimonial1 = new Testimonial({
    			props: testimonial1_props,
    			$$inline: true
    		});

    	platforms = new Platforms({ $$inline: true });
    	const testimonial2_spread_levels = [TESTIMONIALS[2]];
    	let testimonial2_props = {};

    	for (let i = 0; i < testimonial2_spread_levels.length; i += 1) {
    		testimonial2_props = assign(testimonial2_props, testimonial2_spread_levels[i]);
    	}

    	testimonial2 = new Testimonial({
    			props: testimonial2_props,
    			$$inline: true
    		});

    	team = new Team({ $$inline: true });
    	const testimonial3_spread_levels = [TESTIMONIALS[3]];
    	let testimonial3_props = {};

    	for (let i = 0; i < testimonial3_spread_levels.length; i += 1) {
    		testimonial3_props = assign(testimonial3_props, testimonial3_spread_levels[i]);
    	}

    	testimonial3 = new Testimonial({
    			props: testimonial3_props,
    			$$inline: true
    		});

    	work = new Impact({ $$inline: true });
    	const testimonial4_spread_levels = [TESTIMONIALS[4]];
    	let testimonial4_props = {};

    	for (let i = 0; i < testimonial4_spread_levels.length; i += 1) {
    		testimonial4_props = assign(testimonial4_props, testimonial4_spread_levels[i]);
    	}

    	testimonial4 = new Testimonial({
    			props: testimonial4_props,
    			$$inline: true
    		});

    	clients = new Clients({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t0 = space();
    			create_component(topbar.$$.fragment);
    			t1 = space();
    			create_component(parallaxscreen.$$.fragment);
    			t2 = space();
    			create_component(mission.$$.fragment);
    			t3 = space();
    			create_component(testimonial0.$$.fragment);
    			t4 = space();
    			create_component(capabilities.$$.fragment);
    			t5 = space();
    			create_component(testimonial1.$$.fragment);
    			t6 = space();
    			create_component(platforms.$$.fragment);
    			t7 = space();
    			create_component(testimonial2.$$.fragment);
    			t8 = space();
    			create_component(team.$$.fragment);
    			t9 = space();
    			create_component(testimonial3.$$.fragment);
    			t10 = space();
    			create_component(work.$$.fragment);
    			t11 = space();
    			create_component(testimonial4.$$.fragment);
    			t12 = space();
    			create_component(clients.$$.fragment);
    			t13 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "id", "home");
    			add_location(div, file$h, 22, 4, 831);
    			add_location(main, file$h, 21, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(main, t0);
    			mount_component(topbar, main, null);
    			append_dev(main, t1);
    			mount_component(parallaxscreen, main, null);
    			append_dev(main, t2);
    			mount_component(mission, main, null);
    			append_dev(main, t3);
    			mount_component(testimonial0, main, null);
    			append_dev(main, t4);
    			mount_component(capabilities, main, null);
    			append_dev(main, t5);
    			mount_component(testimonial1, main, null);
    			append_dev(main, t6);
    			mount_component(platforms, main, null);
    			append_dev(main, t7);
    			mount_component(testimonial2, main, null);
    			append_dev(main, t8);
    			mount_component(team, main, null);
    			append_dev(main, t9);
    			mount_component(testimonial3, main, null);
    			append_dev(main, t10);
    			mount_component(work, main, null);
    			append_dev(main, t11);
    			mount_component(testimonial4, main, null);
    			append_dev(main, t12);
    			mount_component(clients, main, null);
    			append_dev(main, t13);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const testimonial0_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial0_spread_levels, [get_spread_object(TESTIMONIALS[0])])
    			: {};

    			testimonial0.$set(testimonial0_changes);

    			const testimonial1_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial1_spread_levels, [get_spread_object(TESTIMONIALS[1])])
    			: {};

    			testimonial1.$set(testimonial1_changes);

    			const testimonial2_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial2_spread_levels, [get_spread_object(TESTIMONIALS[2])])
    			: {};

    			testimonial2.$set(testimonial2_changes);

    			const testimonial3_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial3_spread_levels, [get_spread_object(TESTIMONIALS[3])])
    			: {};

    			testimonial3.$set(testimonial3_changes);

    			const testimonial4_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial4_spread_levels, [get_spread_object(TESTIMONIALS[4])])
    			: {};

    			testimonial4.$set(testimonial4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(parallaxscreen.$$.fragment, local);
    			transition_in(mission.$$.fragment, local);
    			transition_in(testimonial0.$$.fragment, local);
    			transition_in(capabilities.$$.fragment, local);
    			transition_in(testimonial1.$$.fragment, local);
    			transition_in(platforms.$$.fragment, local);
    			transition_in(testimonial2.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(testimonial3.$$.fragment, local);
    			transition_in(work.$$.fragment, local);
    			transition_in(testimonial4.$$.fragment, local);
    			transition_in(clients.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topbar.$$.fragment, local);
    			transition_out(parallaxscreen.$$.fragment, local);
    			transition_out(mission.$$.fragment, local);
    			transition_out(testimonial0.$$.fragment, local);
    			transition_out(capabilities.$$.fragment, local);
    			transition_out(testimonial1.$$.fragment, local);
    			transition_out(platforms.$$.fragment, local);
    			transition_out(testimonial2.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(testimonial3.$$.fragment, local);
    			transition_out(work.$$.fragment, local);
    			transition_out(testimonial4.$$.fragment, local);
    			transition_out(clients.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(topbar);
    			destroy_component(parallaxscreen);
    			destroy_component(mission);
    			destroy_component(testimonial0);
    			destroy_component(capabilities);
    			destroy_component(testimonial1);
    			destroy_component(platforms);
    			destroy_component(testimonial2);
    			destroy_component(team);
    			destroy_component(testimonial3);
    			destroy_component(work);
    			destroy_component(testimonial4);
    			destroy_component(clients);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		handleUpdateBaseFont();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		testimonials: TESTIMONIALS,
    		onMount,
    		ParallaxScreen: Splash,
    		Testimonial,
    		handleUpdateBaseFont,
    		Capabilities,
    		Platforms,
    		Team,
    		Footer,
    		Work: Impact,
    		Clients,
    		TopBar,
    		Mission: Exist
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
