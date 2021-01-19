
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
            text: 'Your plan is scalable and operationally integrated across New York, New Jersey and Tribal Nation partners to effectively support coordinated preparedness, protection, response, and mitigation activities.',
            name: 'FEMA HQ',
            title: ''
        },
        {
            text: 'We were able to possess factual, data-driven information to assist the recovery team in making assessments and operational decisions for resources and funding.',
            name: 'Mike Sprayberry',
            title: 'Director of North Carolina Emergency Management'
        },
        {
            text: 'Shaken Fury 2019 highlighted S&T as a go-to partner for technology and innovation benefitting responders and emergency managers.',
            name: 'DHS Science & Technology',
            title: 'Under Secretary’s Award for Building Partnerships'
        },
        {
            text: 'The assessment and workshop was a really good stick on our journey to understand how we can better use evidence, better use storytelling, and better use good science and intelligence to lead change and to have a more resilient City.',
            name: 'Mike Mendonca',
            title: 'Chief Resilience Officer Wellington, New Zealand'
        },
        {
            text: '(His city used ResponderCQ to) better understand where our strengths are with respect to geographic information systems (GIS) and resilience information management, and more importantly where our weaknesses are and where we have gaps. Knowing what is not working is as essential to improving overall resilience as knowing what does work well.',
            name: 'Mike Mendonca',
            title: 'Chief Resilience Officer Wellington, New Zealand'
        }
    ];

    const CONTENT = [
        [
            {
                leadin: 'In just the last twenty years,',
                text: 'disasters have claimed millions of lives, affected billions of people, and cost trillions in economic losses across the globe. SPIN Global exists to disrupt the impact of disasters from neighborhoods to nations. We are moved by compassion to reduce needless physical, social and economic suffering caused by disasters.'
            },
            {
                leadin: 'People and organizations',
                text: 'are often too reactive, not ready to contend with the realities of the 21st century. But we can change that. We are committed to working with traditionally underrepresented groups, private industry, public institutions, and for a higher purpose.'
            }
        ],
        [
            {
                leadin: 'We believe',
                text: 'that by tackling the biggest challenges of our generation, we will discover new opportunities to substantially reduce the risk for the most vulnerable. Inclusion, equity, and innovation are required to create real and lasting value for humanity.'
            },
            {
                leadin: 'Every time a client hires SPIN Global,',
                text: 'we give back to their community by delivering similar services at no cost to at-risk communities, or by making a donation to local charities. We are a public benefit corporation committed to stewardship of people, planet and profit. We hope for the chance to earn your trust and loyalty.'
            }
        ]
    ];

    /* src/components/Page.svelte generated by Svelte v3.31.2 */

    const file = "src/components/Page.svelte";

    // (9:4) {#if text}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(p, "class", "font_text-primary text-center");
    			add_location(p, file, 9, 8, 269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:4) {#if text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let div0_id_value;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let if_block = /*text*/ ctx[1] && create_if_block(ctx);
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
    			attr_dev(div0, "class", "page-link relative svelte-1rorh9i");
    			attr_dev(div0, "id", div0_id_value = /*headerText*/ ctx[0].toLowerCase().replace(/ /g, "_"));
    			add_location(div0, file, 6, 4, 99);
    			attr_dev(h1, "class", "font_header-primary m-l1");
    			add_location(h1, file, 7, 4, 191);
    			attr_dev(div1, "class", "flex-col--cc");
    			add_location(div1, file, 5, 0, 68);
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
    					if_block = create_if_block(ctx);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
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
    		init(this, options, instance, create_fragment, safe_not_equal, { headerText: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment.name
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

    /* src/components/Mission.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/components/Mission.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (24:16) {#each missionStatements[0] as stmts}
    function create_each_block_1(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*stmts*/ ctx[3].leadin + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*stmts*/ ctx[3].text + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(h2, "class", "font_header-secondary inline");
    			add_location(h2, file$1, 25, 24, 973);
    			attr_dev(p, "class", "font_text-primary inline");
    			add_location(p, file$1, 26, 24, 1058);
    			attr_dev(div, "class", "text-center m-l");
    			add_location(div, file$1, 24, 20, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(24:16) {#each missionStatements[0] as stmts}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {#each missionStatements[1] as stmts}
    function create_each_block(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*stmts*/ ctx[3].leadin + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*stmts*/ ctx[3].text + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(h2, "class", "font_header-secondary inline");
    			add_location(h2, file$1, 43, 20, 1739);
    			attr_dev(p, "class", "font_text-primary inline text-center");
    			add_location(p, file$1, 44, 20, 1820);
    			attr_dev(div, "class", "text-center m-l2");
    			add_location(div, file$1, 42, 16, 1688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:12) {#each missionStatements[1] as stmts}",
    		ctx
    	});

    	return block;
    }

    // (20:0) <Page {...pageInfo}>
    function create_default_slot(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let div1_class_value;
    	let t1;
    	let div4;
    	let div3;
    	let div3_class_value;
    	let each_value_1 = CONTENT[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = CONTENT[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex-col--tc flex flex--space-around");
    			add_location(div0, file$1, 22, 12, 794);
    			attr_dev(img, "class", "mission-image us-none br-px8 m-auto-l1 svelte-4vj8sh");
    			if (img.src !== (img_src_value = "https://media.istockphoto.com/photos/team-teamwork-business-join-hand-together-concept-power-of-volunteer-picture-id1017183652?s=2048x2048")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Recovering From Disaster");
    			set_style(img, "width", /*width*/ ctx[1]);
    			add_location(img, file$1, 31, 12, 1194);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*rowClass*/ ctx[0]) + " svelte-4vj8sh"));
    			add_location(div1, file$1, 21, 8, 757);
    			attr_dev(div2, "class", "p-l0");
    			add_location(div2, file$1, 20, 4, 730);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(/*rowClass*/ ctx[0]) + " svelte-4vj8sh"));
    			add_location(div3, file$1, 40, 8, 1597);
    			attr_dev(div4, "class", "p-l1");
    			add_location(div4, file$1, 39, 4, 1570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, img);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*missionStatements*/ 0) {
    				each_value_1 = CONTENT[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*width*/ 2) {
    				set_style(img, "width", /*width*/ ctx[1]);
    			}

    			if (dirty & /*rowClass*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*rowClass*/ ctx[0]) + " svelte-4vj8sh"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*missionStatements*/ 0) {
    				each_value = CONTENT[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*rowClass*/ 1 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*rowClass*/ ctx[0]) + " svelte-4vj8sh"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[2]];

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
    			const page_changes = (dirty & /*pageInfo*/ 4)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[2])])
    			: {};

    			if (dirty & /*$$scope, rowClass, width*/ 259) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mission", slots, []);

    	let rowClass = mediaManager.active < mediaManager.breaks[5]
    	? "flex-col--tc"
    	: "flex-row--tc flex--stretch";

    	let width = mediaManager.active < mediaManager.breaks[5]
    	? "80%"
    	: "50%";

    	mediaManager.addEventListener("change", () => {
    		$$invalidate(0, rowClass = mediaManager.active < mediaManager.breaks[5]
    		? "flex-col--tc"
    		: "flex-row--tc flex--stretch");

    		$$invalidate(1, width = mediaManager.active < mediaManager.breaks[5]
    		? "80%"
    		: "50%");
    	});

    	const pageInfo = { headerText: "Our Mission", text: "" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mission> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		missionStatements: CONTENT,
    		Page,
    		mediaManager,
    		rowClass,
    		width,
    		pageInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("rowClass" in $$props) $$invalidate(0, rowClass = $$props.rowClass);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rowClass, width, pageInfo];
    }

    class Mission extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mission",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/pages/ParallaxScreen.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/pages/ParallaxScreen.svelte";

    function create_fragment$2(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let mission;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	mission = new Mission({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Disrupting disasters, from neighborhoods to nations";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(mission.$$.fragment);
    			attr_dev(h1, "class", "font_header-primary absolute w-max-n2 svelte-hbofyk");
    			set_style(h1, "color", "white");
    			add_location(h1, file$2, 21, 4, 636);
    			attr_dev(div0, "class", "splash-surface flex-col--cc svelte-hbofyk");
    			add_location(div0, file$2, 20, 0, 590);
    			attr_dev(div1, "class", "parallax-surface m-auto br-px8 w-p95 w-max-n2 m-auto svelte-hbofyk");
    			add_location(div1, file$2, 26, 4, 890);
    			attr_dev(div2, "class", "parallax-positioner absolute svelte-hbofyk");
    			set_style(div2, "top", -/*range*/ ctx[2](calcScrollPct(/*height*/ ctx[1], /*scrollY*/ ctx[0])) + "vh");
    			add_location(div2, file$2, 25, 0, 786);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(mission, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					}),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (!current || dirty & /*height, scrollY*/ 3) {
    				set_style(div2, "top", -/*range*/ ctx[2](calcScrollPct(/*height*/ ctx[1], /*scrollY*/ ctx[0])) + "vh");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mission.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mission.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(mission);
    			mounted = false;
    			run_all(dispose);
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

    function calcScrollPct(height, scrollAmt) {
    	if (scrollAmt < 0) return 0;
    	if (scrollAmt > height) return height;
    	return scrollAmt / height;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ParallaxScreen", slots, []);
    	const lerp = (x, y, a) => x * (1 - a) + y * a;
    	const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    	const genRange = (a, b, c) => x => clamp(lerp(a, b, x), a, c || b);
    	const range = genRange(-80, 90);
    	let scrollY;
    	let height;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ParallaxScreen> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollY = window.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(1, height = window.innerHeight);
    	}

    	$$self.$capture_state = () => ({
    		Mission,
    		calcScrollPct,
    		lerp,
    		clamp,
    		genRange,
    		range,
    		scrollY,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("scrollY" in $$props) $$invalidate(0, scrollY = $$props.scrollY);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [scrollY, height, range, onwindowscroll, onwindowresize];
    }

    class ParallaxScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ParallaxScreen",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Testimonial.svelte generated by Svelte v3.31.2 */

    const file$3 = "src/components/Testimonial.svelte";

    // (14:12) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "font_text-primary pb-l1");
    			add_location(p, file$3, 14, 16, 518);
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
    function create_if_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*title*/ ctx[2]);
    			attr_dev(p, "class", "font_text-primary text-center pb-l1");
    			add_location(p, file$3, 12, 16, 423);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(12:12) {#if title !== ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let p;
    	let t0;
    	let t1;
    	let div0;
    	let h2;
    	let t2;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (/*title*/ ctx[2] !== "") return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			p = element("p");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t2 = text(/*name*/ ctx[1]);
    			t3 = space();
    			if_block.c();
    			attr_dev(p, "class", "font_text-primary text-italic text-center pr-l1 pl-l1 pt-l0 pb-l0");
    			add_location(p, file$3, 8, 8, 216);
    			attr_dev(h2, "class", "font_header-secondary");
    			add_location(h2, file$3, 10, 12, 330);
    			add_location(div0, file$3, 9, 8, 312);
    			attr_dev(div1, "class", "testimonial-surface br-px8 m-auto-l4 w-max-n2 svelte-ip75mb");
    			add_location(div1, file$3, 7, 4, 148);
    			attr_dev(div2, "class", "testimonial-background of-auto svelte-ip75mb");
    			add_location(div2, file$3, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t2);
    			append_dev(div0, t3);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);
    			if (dirty & /*name*/ 2) set_data_dev(t2, /*name*/ ctx[1]);

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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { text: 0, name: 1, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testimonial",
    			options,
    			id: create_fragment$3.name
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

    /* src/pages/Capabilities.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/pages/Capabilities.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (23:12) {#each capabilities as cap}
    function create_each_block$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1_value = /*cap*/ ctx[2].text + "";
    	let t1;
    	let t2;
    	let div0;
    	let p1;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = "Learn More";
    			t4 = space();
    			if (img.src !== (img_src_value = `/capabilities/${/*cap*/ ctx[2].img}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "capability icon");
    			add_location(img, file$4, 24, 20, 1306);
    			attr_dev(p0, "class", "font_text-primary text-center capability-paragraph inline svelte-qwyh8g");
    			add_location(p0, file$4, 25, 20, 1387);
    			attr_dev(p1, "class", "font_text-primary text-center learn-more-text m-l0 p-n2");
    			add_location(p1, file$4, 27, 24, 1574);
    			attr_dev(div0, "class", "learn-more-surface br-px4 flex-col--cc mt-l1 svelte-qwyh8g");
    			add_location(div0, file$4, 26, 20, 1491);
    			attr_dev(div1, "class", "capability-surface br-px8 m-l2 p-l3 flex-col--tc svelte-qwyh8g");
    			add_location(div1, file$4, 23, 16, 1223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(div1, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(23:12) {#each capabilities as cap}",
    		ctx
    	});

    	return block;
    }

    // (20:0) <Page {...pageInfo}>
    function create_default_slot$1(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*capabilities*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file$4, 21, 8, 1161);
    			attr_dev(div1, "class", "flex-col--tc");
    			add_location(div1, file$4, 20, 4, 1126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*capabilities*/ 1) {
    				each_value = /*capabilities*/ ctx[0];
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
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(20:0) <Page {...pageInfo}>",
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Capabilities", slots, []);

    	const capabilities = [
    		{
    			text: "Data-driven assessments before, during and after disasters",
    			img: "data_icon.png"
    		},
    		{
    			text: "Institutional capacity building and regional security cooperation",
    			img: "institutional_icon.png"
    		},
    		{
    			text: "Strategic management, scientific, and technical consulting",
    			img: "strategic_icon.png"
    		},
    		{
    			text: "Rapid response and recovery support",
    			img: "rapid_icon.png"
    		},
    		{
    			text: "Universal risk reduction, resilience and emergency management services",
    			img: "universal_icon.png"
    		},
    		{
    			text: "Planning, training and exercises for all hazards and incident types",
    			img: "planning_icon.png"
    		},
    		{
    			text: "Teach and prepare neighborhoods and nations using our \"Planet Ready\" platform",
    			img: "teach_icon.png"
    		}
    	];

    	const pageInfo = {
    		headerText: "Our Capabilities",
    		text: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi"
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Capabilities",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Platforms.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/pages/Platforms.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (35:8) {#each platforms as plat}
    function create_each_block$2(ctx) {
    	let a;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;
    	let t1_value = /*plat*/ ctx[6].title + "";
    	let t1;
    	let t2;
    	let div0;
    	let p;
    	let div1_class_value;
    	let t4;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Visit";
    			t4 = space();
    			if (img.src !== (img_src_value = /*plat*/ ctx[6].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", `${/*plat*/ ctx[6].title} Icon`);
    			attr_dev(img, "class", "svelte-1cpnku0");
    			add_location(img, file$5, 37, 20, 1675);
    			attr_dev(h3, "class", "font_header-tertiary m-l1");
    			add_location(h3, file$5, 38, 20, 1745);
    			attr_dev(p, "class", "font_text-primary m-n3 svelte-1cpnku0");
    			add_location(p, file$5, 40, 24, 1893);
    			attr_dev(div0, "class", "visit-surface br-px4 flex-col--cc svelte-1cpnku0");
    			add_location(div0, file$5, 39, 20, 1821);
    			attr_dev(div1, "class", div1_class_value = "platform-surface flex-col--cc " + /*marginClasses*/ ctx[2] + " svelte-1cpnku0");
    			set_style(div1, "width", /*width*/ ctx[1]);
    			add_location(div1, file$5, 36, 16, 1571);
    			attr_dev(a, "href", ctx[6].url);
    			add_location(a, file$5, 35, 12, 1535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(a, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*marginClasses*/ 4 && div1_class_value !== (div1_class_value = "platform-surface flex-col--cc " + /*marginClasses*/ ctx[2] + " svelte-1cpnku0")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*width*/ 2) {
    				set_style(div1, "width", /*width*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(35:8) {#each platforms as plat}",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Page {...pageInfo}>
    function create_default_slot$2(ctx) {
    	let div;
    	let each_value = /*platforms*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "flex-row--tc flex--wrap flex--space-around");
    			set_style(div, "flex-direction", /*direction*/ ctx[0]);
    			set_style(div, "max-width", /*maxWidth*/ ctx[3]);
    			add_location(div, file$5, 33, 4, 1373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*platforms, marginClasses, width*/ 38) {
    				each_value = /*platforms*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*direction*/ 1) {
    				set_style(div, "flex-direction", /*direction*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(33:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let page;
    	let current;
    	const page_spread_levels = [/*pageInfo*/ ctx[4]];

    	let page_props = {
    		$$slots: { default: [create_default_slot$2] },
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
    			const page_changes = (dirty & /*pageInfo*/ 16)
    			? get_spread_update(page_spread_levels, [get_spread_object(/*pageInfo*/ ctx[4])])
    			: {};

    			if (dirty & /*$$scope, direction, marginClasses, width*/ 519) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Platforms", slots, []);
    	const maxWidth = mediaManager.breaks[3];

    	let direction = mediaManager.active <= mediaManager.breaks[3]
    	? "column"
    	: "row";

    	let width = mediaManager.active < mediaManager.breaks[3]
    	? "90vw"
    	: "520px";

    	let marginClasses = mediaManager.active <= mediaManager.breaks[3]
    	? "mt-l2 mb-l2"
    	: "m-l2";

    	mediaManager.addEventListener("change", e => {
    		$$invalidate(1, width = mediaManager.active < mediaManager.breaks[3]
    		? "90vw"
    		: "520px");

    		$$invalidate(2, marginClasses = mediaManager.active <= mediaManager.breaks[3]
    		? "mt-l2 mb-l2"
    		: "m-l2");

    		$$invalidate(0, direction = mediaManager.active <= mediaManager.breaks[3]
    		? "column"
    		: "row");
    	});

    	const pageInfo = {
    		headerText: "Our Platforms",
    		text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    	};

    	const platforms = [
    		{
    			icon: "https://planet-ready-combined-app.s3.amazonaws.com/assets/planetready-logo-300x80.png",
    			title: "Planet Ready",
    			url: "https://www.planetready.com"
    		},
    		{
    			icon: "/responder_cq.png",
    			title: "ResponderCQ",
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
    		width,
    		marginClasses,
    		pageInfo,
    		platforms
    	});

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("marginClasses" in $$props) $$invalidate(2, marginClasses = $$props.marginClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [direction, width, marginClasses, maxWidth, pageInfo, platforms];
    }

    class Platforms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Platforms",
    			options,
    			id: create_fragment$5.name
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
            ask: ['Partnerships & Relationship Management', 'Community Engagement', 'Crisis Communications', 'Disaster Response'],
            experience: 'Mallory joined SPIN Global in September 2020, but her disaster response experience started 8 years ago as Executive Director of the American Red Cross of the Mohawk Valley, where she served until April 2020. In this role, she responded to over 300 home fires and other local disasters and completed 12 deployments to national disasters including Hurricane Harvey, Hurricane Irma, and the 2019 Dayton mass shooting. She also serves as a board member of NY VOAD (Voluntary Organizations Active in Disaster). Prior to becoming involved in emergency management, she held marketing and communications roles for Bassett Healthcare Network, Carrols Corporation, and the Syracuse Post-Standard.',
            ln: 'malloryabrown'
        },
        {
            first_name: 'Alwin',
            last_name: 'Sheriff',
            title: 'Media Specialist',
            bio: 'Alwin joined the SPIN Global team in 2019 because he was looking for an opportunity that would share his brand ideals and foster his creative capabilities. He has 5+ years in video production, storyboarding, and animation. He has produced 30+ videos, commercials, animated clips, graphics, and training videos for SPIN Clients and corporate distribution.',
            education: ['Montgomery College: A.A., Business Management', 'Maryland University: B.A., Business Management and Entrepreneurship Specialization.'],
            ask: ['Social Media and Marketing Campaign Directives', 'Video Production Operations'],
            experience: 'Prior to joining the SPIN Global video production team in October 2019, Alwin sought out agencies that not only shared his brand ideals but would foster his creative capabilities. He has 5+ years in video production, storyboarding, and animation. He has produced 30+ videos, commercials, animated clips, graphics, and training videos for SPIN Clients and corporate distribution.',
            ln: 'alwinthesherrif'
        },
        {
            first_name: 'Alexa',
            last_name: 'Squirini',
            title: 'Analyst',
            bio: 'Hurricane Sandy devastated my New Jersey hometown. I took emergency management classes in college and was a part of a program at a Department of Homeland Security-funded research institute. When I found SPIN Global through an internship in college, it was the perfect fit to blend my personal experience with disaster and my education. I desire to be a part of work that makes a difference in community resilience.',
            education: ['University of Maryland: B.A., Government & Politics, Global Terrorism Studies'],
            ask: ['GIS', 'Training', 'Exercises', 'Where to get pizza in your city'],
            experience: 'Alexa joined SPIN Global in 2017. Prior to her employment with SPIN Global, Alexa was a student-athlete at UMD and worked at the National Consortium for the Study of Terrorism and Responses to Terrorism (START Center), as a Geographic Information Systems Intern as well as a TEVUS Intern. Alexa worked for the U.S. Department of Agriculture, Personnel Security and Suitability as well as the Partnership for Public Service. Alexa has had experience working domestically and internationally with SPIN Global and has worked to provide community engagement, planning, training, and exercise services.',
            ln: 'alexa-maureen-squirini-3a4523b6'
        },
        {
            first_name: 'Dawn',
            last_name: 'Covin',
            title: 'Project Control Officer',
            bio: 'SPIN Global’s focus on improving disaster resilience outcomes from “Neighborhoods to Nations” aligns with my commitment to impact positive change for inner-city communities. As a part of a Public Benefit Corporation, it is inspiring to know that stewardship of resources is a priority.',
            education: ['University of North Carolina at Greensboro: B.S., Finance and Marketing', 'University of Delaware: MBA'],
            ask: ['PMP® Certification', 'Contracts Administration', 'Work-Life Integration'],
            experience: 'Dawn joined SPIN Global in 2016. Prior to her employment with SPIN Global, Dawn worked for IBM as a Business Continuity, Disaster Recovery Consultant, developing disaster resilience strategies for companies throughout the US. Dawn has conducted research, performed business impact and risk assessments, facilitated simulated exercises, and provided mitigation recommendations to banks, insurance companies, government agencies, youth organizations, manufacturers, and retailers.',
            ln: 'dawncovin'
        },
        {
            first_name: 'Diane',
            last_name: 'Vickerman',
            title: 'Emergency Management Specialist',
            bio: 'I have always loved working to help others, and found the perfect fit with SPIN Global. I was drawn to emergency management after witnessing the devastating impacts of disasters to people’s lives.',
            education: ['University of California at Berkeley, Bachelor of Arts'],
            ask: ['Public Health', 'Emergency Management in Healthcare', 'Crisis Counseling'],
            experience: 'In 2013 while working as a crisis counselor at a hospital Diane was recruited to the role of Emergency Preparedness Manager for Calaveras County Public Health in California. She was responsible for overseeing all aspects of disaster management including planning and preparedness, logistics and response.  In her role at the county she had the opportunity to attend numerous trainings throughout the United States and has an excellent understanding of the Incident command System (ICS).  After working in the public health field Diane had the opportunity to work at several hospitals overseeing emergency management including Wahiawa General Hospital in Hawaii, which included a hundred bed skilled nursing facility. Prior to joining SPIN Global in September 2020, Diane was working for the Office of Emergency Management at Stanford Hospital. She is currently a Mid-Level Planner assisting FEMA in Region 9.',
            ln: ''
        },
        {
            first_name: 'Camila',
            last_name: 'Tapias',
            title: 'Jr. Analyst',
            bio: 'Growing up in Colombia, I’ve always wanted to make a difference in the world by providing opportunities and useful resources for vulnerable communities. I decided to pursue a career in public affairs and consequently find a team where the integration of data, technology and innovation, and empathy were prioritized to efficiently support communities to become more resilient.',
            education: ['The George Washington University: B.A., Organizational Sciences, Psychology & Criminal Justice', 'The George Washington University: M.A., Public Administration, Crisis & Emergency Management'],
            ask: ['Higher Education', 'Preparedness', 'Youth & Young Professional Engagement', 'GIS'],
            experience: 'Camila Tapias joined SPIN Global in June 2020. Prior to joining the team, she was a Presidential Fellow at The George Washington University where she worked at the Office of the President while obtaining her MPA, and was the primary point of contact for student outreach, communication, and safety. She collaborated with the Division of Safety and Security to improve the culture of preparedness, and led the efforts to update the university’s Closed Point of Dispensing Plan (CPOD) amidst the COVID-19 pandemic. Before she worked in higher education and emergency management, she played for her alma mater’s Division I Women’s Basketball team and also represented the Colombian National team for nine years.',
            ln: 'camilatapias'
        },
        {
            first_name: 'Benjamin',
            last_name:'Wallace',
            title: 'Mid-Level Planner',
            bio: 'I am driven by a desire to help people through authentic engagement and effective organizational management, so I enjoy developing solutions to complex social and environmental problems to improve the world.',
            education: ['University of Delaware: B.A., Sociology', 'University of Delaware: B.A., Philosophy', 'University of Delaware: M.S., Disaster Science and Management'],
            ask: ['Climate Change', 'EM Technology (e.g., GIS UAVs)', 'Hurricanes', 'Organizational Management/Leadership', 'Policy'],
            experience: 'After working in a state legislature, a public non-profit, and a center studying disabilities, he worked in emergency management consulting writing and editing plans for Ebola, nuclear terrorism, hurricanes, COVID-19, power outages, and nuclear power plants. He has published research on climate change and disaster management, and has certificates in leadership and professional development.',
            ln: 'bendwallace'
        },
        {
            first_name: 'Brian',
            last_name: 'Kruzan',
            title: 'Senior Analyst',
            bio: 'After supporting data-driven projects in the transportation industry for over a decade, I was eager to join a team determined on reducing human suffering across the planet through innovative solutions.',
            education: ['Southern New Hampshire University, Public Administration'],
            ask: ['Project Management and Support', 'Administration', 'After Action Analysis'],
            experience: 'Brian joined SPIN Global in 2019 to support First Responder Technology for The U.S. Department of Homeland Security. Prior to his time with SPIN Global, Brian worked in program management and data analysis for FedEx leading a corporate project to redesign loss and damage processes. He also set corporate service goals and improved divisional operational compliance scores. In 2018 he followed his passion for people and served at Redemption Hill Church in Washington, DC full-time as the Assistant Pastor of Music and Spiritual Formation.',
            ln: 'briankruzan'
        },
        {
            first_name: 'Dave',
            last_name: 'Wheeler',
            title: 'Logistics Planning Specialist',
            bio: 'I had the opportunity to be a part of a unique team that focused solely on domestic operations and service to the community and its leaders. I got to work, plan, train and serve alongside some of the most dedicated individuals and first responders at both the Federal and State levels.',
            education: ['Marshall University: Board of Regents BA'],
            ask: ['Operations Management', 'Training and Development', 'CBRNE'],
            experience: 'Dave is a military veteran with over 15+ years of proven experience in the United States Army accomplishing measurable results while leading teams in a dynamic, fast-paced environment.  He has a comprehensive background in Emergency Management with emphasis on Chemical, Biological Radiological, Nuclear and Explosive (CBRNE) operations, derived from conducting both domestic and global operations. He has conducted risk management across multiple lines to protect assets, property, and equipment and possesses extensive knowledge in operations management, exercise development, and human resource administration.  He has conducted planning, training, and executed support for numerous disaster operations in support of State and Federal partners ranging from hurricanes, wildfires, snowstorms and man-made events.',
            ln: 'david-wheeler-sentinel'
        },
        {
            first_name: 'Morgan',
            last_name: 'Johnson',
            title: 'Emergency Management Specialist',
            bio: 'Since I was a kid picking up trash during my local beach cleanup day, I knew I wanted to go into a career field that allowed me to serve my community. With SPIN Global, not only am I in a position to help my neighbors - I am able to leverage my skills to help people all over the country and around the world manage the crises affecting them.',
            education: ['The College of William & Mary: B.S., Psychology', 'University of North Carolina at Chapel Hill: M.P.H., Health Behavior & Health Education'],
            ask: ['Emergency Management', 'Governmental Relations', 'Community Resilience', 'Public Health'],
            experience: 'Morgan began her career in emergency management with front line positions supporting hurricane response for the State of North Carolina and FEMA Region IV. For 17 years and counting, Morgan has applied her comprehensive emergency management experience - including a Master Exercise Practitioner certification - to roles at all levels of government. Since joining SPIN in 2018, Morgan\'s talents and subject matter expertise have been applied to multi-region planning and training efforts, national-level exercises, technology adoption, and strategic data modelling to the emergency management sphere.',
            ln: 'morganlynjohnson'
        },
        {
            first_name: 'Joel',
            last_name: 'Thomas',
            title: 'CEO',
            bio: 'Compassion is the reason why I do what I do. I have witnessed abject poverty and the devastating aftermath of disasters in many parts of the world. I\'ll never forget what I have observed and experienced, and hope to steward the opportunity I have been given and produce lasting fruit not just for today, but for generations to come.',
            education: ['Trinity International University: B.A., Business, Non-Profit Management', 'The George Washington University: M.A., Public Administration, International Development', 'Tulane University: Senior Fellow, Disaster Resilience Leadership Academy'],
            ask: ['Stories from 50+ Countries', 'Why we are a Public Benefit Corporation', 'Our "Olive Tree" Organizational Chart', 'Skating to where the puck is going to be'],
            experience: 'For the last twenty years, Joel has supported the design and implementation of local, national and multinational preparedness and risk reduction initiatives in 50+ countries and in 50 U.S. states and territories. His work is rooted in experience supporting response to hundreds of local and large scale disasters as a volunteer, an urban campus first responder in Washington D.C., and as a homeland security and emergency management professional that has participated in domestic and international response and recovery operations.',
            ln: 'joeldavidthomas'
        },
        {
            first_name: 'Alessandro',
            last_name: 'MacLaine',
            title: 'Lead Developer',
            bio: 'I\'ve been driven my whole life by a love for technology and a passion to improve the world. SPIN Global allows me combine these qualities everyday.',
            education: ['UC, Irvine: BS Mathematics for Quantitative Economics', 'UC, Irvine: BS Software Engineering'],
            ask: ['Technology', 'Digital Media'],
            experience: 'After his first degree, Alessandro worked in Finance in the Real Estate and Entertainment industries. Dissatisfied with calculating ROI and investor profits, he returned to UCI for a second degree in Software Engineering. He has worked on numerous open source and commercial projects and as a programming instructor at UCI\'s Coding Bootcamp.',
            ln: 'almaclaine'
        }
    ];

    /* src/components/MemberCard.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/components/MemberCard.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (18:0) {#if open}
    function create_if_block$2(ctx) {
    	let div2;
    	let div1;
    	let h20;
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let t4;
    	let h21;
    	let t6;
    	let ul0;
    	let t7;
    	let h22;
    	let t9;
    	let div0;
    	let p1;
    	let t10;
    	let t11;
    	let h23;
    	let t13;
    	let ul1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*education*/ ctx[6];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*ask*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			t0 = text(/*first_name*/ ctx[0]);
    			t1 = text("'s \"Why\"");
    			t2 = space();
    			p0 = element("p");
    			t3 = text(/*bio*/ ctx[3]);
    			t4 = space();
    			h21 = element("h2");
    			h21.textContent = "Education";
    			t6 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			h22 = element("h2");
    			h22.textContent = "Past Experience";
    			t9 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t10 = text(/*experience*/ ctx[4]);
    			t11 = space();
    			h23 = element("h2");
    			h23.textContent = "Ask Me About";
    			t13 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "font_header-secondary text-center");
    			add_location(h20, file$6, 20, 12, 657);
    			attr_dev(p0, "class", "font_text-primary text-center m-l2 svelte-x7xpb4");
    			add_location(p0, file$6, 21, 12, 741);
    			attr_dev(h21, "class", "font_header-secondary text-left");
    			add_location(h21, file$6, 22, 12, 809);
    			attr_dev(ul0, "class", "ml-l2");
    			add_location(ul0, file$6, 24, 12, 881);
    			attr_dev(h22, "class", "font_header-secondary mt-l1 text-left");
    			add_location(h22, file$6, 30, 12, 1057);
    			attr_dev(p1, "class", "font_text-primary svelte-x7xpb4");
    			add_location(p1, file$6, 32, 16, 1176);
    			attr_dev(div0, "class", "ml-l2");
    			add_location(div0, file$6, 31, 12, 1140);
    			attr_dev(h23, "class", "font_header-secondary text-left");
    			add_location(h23, file$6, 35, 12, 1254);
    			attr_dev(ul1, "class", "ml-l2");
    			add_location(ul1, file$6, 38, 12, 1358);
    			attr_dev(div1, "class", "big-bio of-auto br-px8 w-max-v80 w-p100 m-l4 p-l4 svelte-x7xpb4");
    			add_location(div1, file$6, 19, 8, 581);
    			attr_dev(div2, "class", "modal fixed w-v100 flex-col--tc svelte-x7xpb4");
    			add_location(div2, file$6, 18, 4, 492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, h21);
    			append_dev(div1, t6);
    			append_dev(div1, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div1, t7);
    			append_dev(div1, h22);
    			append_dev(div1, t9);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, h23);
    			append_dev(div1, t13);
    			append_dev(div1, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", self$1(/*click_handler*/ ctx[12]), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*first_name*/ 1) set_data_dev(t0, /*first_name*/ ctx[0]);
    			if (dirty & /*bio*/ 8) set_data_dev(t3, /*bio*/ ctx[3]);

    			if (dirty & /*education*/ 64) {
    				each_value_1 = /*education*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*experience*/ 16) set_data_dev(t10, /*experience*/ ctx[4]);

    			if (dirty & /*ask*/ 32) {
    				each_value = /*ask*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (26:16) {#each education as edu}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t_value = /*edu*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "font_text-primary svelte-x7xpb4");
    			add_location(li, file$6, 26, 20, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*education*/ 64 && t_value !== (t_value = /*edu*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(26:16) {#each education as edu}",
    		ctx
    	});

    	return block;
    }

    // (40:16) {#each ask as edu}
    function create_each_block$3(ctx) {
    	let li;
    	let t_value = /*edu*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "font_text-primary svelte-x7xpb4");
    			add_location(li, file$6, 40, 20, 1432);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ask*/ 32 && t_value !== (t_value = /*edu*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(40:16) {#each ask as edu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
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
    	let mounted;
    	let dispose;
    	let if_block = /*open*/ ctx[7] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
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
    			attr_dev(img, "class", "us-none svelte-x7xpb4");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[9]);
    			add_location(img, file$6, 48, 4, 1616);
    			attr_dev(h20, "class", "font_header-secondary");
    			add_location(h20, file$6, 50, 8, 1704);
    			attr_dev(h21, "class", "font_header-secondary");
    			add_location(h21, file$6, 51, 8, 1764);
    			attr_dev(p0, "class", "font_text-primary text-center w-max-p90 svelte-x7xpb4");
    			add_location(p0, file$6, 52, 8, 1823);
    			attr_dev(p1, "class", "font_text-primary text-center inline ln svelte-x7xpb4");
    			add_location(p1, file$6, 55, 16, 1982);
    			attr_dev(a, "href", /*linkedinUrl*/ ctx[10]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 54, 12, 1927);
    			attr_dev(p2, "class", "font_text-primary text-center inline svelte-x7xpb4");
    			add_location(p2, file$6, 57, 12, 2075);
    			attr_dev(p3, "class", "font_text-primary bio inline svelte-x7xpb4");
    			add_location(p3, file$6, 58, 12, 2141);
    			attr_dev(div0, "class", "m-auto");
    			add_location(div0, file$6, 53, 8, 1894);
    			attr_dev(div1, "class", "flex-col--tc");
    			add_location(div1, file$6, 49, 4, 1669);
    			attr_dev(div2, "class", "member-surface of-hidden br-px8 m-l3 flex-col--tc svelte-x7xpb4");
    			add_location(div2, file$6, 47, 0, 1548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
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

    			if (!mounted) {
    				dispose = listen_dev(p3, "click", /*click_handler_1*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*imgSrc*/ 256 && img.src !== (img_src_value = /*imgSrc*/ ctx[8])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imgAlt*/ 512) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[9]);
    			}

    			if (dirty & /*first_name*/ 1) set_data_dev(t2, /*first_name*/ ctx[0]);
    			if (dirty & /*last_name*/ 2) set_data_dev(t4, /*last_name*/ ctx[1]);
    			if (dirty & /*title*/ 4) set_data_dev(t6, /*title*/ ctx[2]);

    			if (dirty & /*linkedinUrl*/ 1024) {
    				attr_dev(a, "href", /*linkedinUrl*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MemberCard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(7, open = false);
    	const click_handler_1 = () => $$invalidate(7, open = true);

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
    			 $$invalidate(10, linkedinUrl = `https://www.linkedin.com/in/${ln}`);
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
    		click_handler,
    		click_handler_1
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

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (25:8) {#each teamMembers.sort(sorter) as member}
    function create_each_block$4(ctx) {
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(25:8) {#each teamMembers.sort(sorter) as member}",
    		ctx
    	});

    	return block;
    }

    // (23:0) <Page {...pageInfo}>
    function create_default_slot$3(ctx) {
    	let div;
    	let current;
    	let each_value = TeamMembers.sort(sorter);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "team-surface w-max-n1 m-auto flex--wrap flex-row--tc");
    			add_location(div, file$7, 23, 4, 633);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*teamMembers, sorter*/ 0) {
    				each_value = TeamMembers.sort(sorter);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "w-v20");
    			if (img.src !== (img_src_value = "./spin_logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SPIN Logo");
    			add_location(img, file$8, 1, 4, 51);
    			attr_dev(div, "class", "flex-row--cc pt-l3 pb-l3 us-none svelte-azccfr");
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
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

    /* src/pages/Work.svelte generated by Svelte v3.31.2 */
    const file$9 = "src/pages/Work.svelte";

    // (9:0) <Page {...pageInfo}>
    function create_default_slot$4(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "500");
    			attr_dev(iframe, "height", "400");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "scrolling", "no");
    			attr_dev(iframe, "title", "SPIN Global Client Engagement Polygons");
    			if (iframe.src !== (iframe_src_value = "//www.arcgis.com/apps/Embed/index.html?webmap=a941dce990c84dac92b343c0ad4da62b&extent=-180,-68.4638,180,86.2326&zoom=true&previewImage=false&scale=true&disable_scroll=true&theme=light&level=4")) attr_dev(iframe, "src", iframe_src_value);
    			add_location(iframe, file$9, 10, 8, 313);
    			attr_dev(div, "class", "embed-container mt-l1 w-p100");
    			add_location(div, file$9, 9, 4, 262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(9:0) <Page {...pageInfo}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Work", slots, []);

    	const pageInfo = {
    		headerText: "Our Work",
    		text: "Each shaded area on the map represents one of our projects in neighborhoods and nations."
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page, pageInfo });
    	return [pageInfo];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const ClientsList = [
        {
            name: 'Seal of Prince William County1',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County2',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County3',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County4',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County5',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County6',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County7',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County8',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County9',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County10',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County11',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County12',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County13',
            src: './prince_williams.png'
        },
        {
            name: 'Seal of Prince William County14',
            src: './prince_williams.png'
        }
    ];

    /* src/pages/Clients.svelte generated by Svelte v3.31.2 */
    const file$a = "src/pages/Clients.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:8) {#each clientList as client}
    function create_each_block$5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", "client-logo");
    			if (img.src !== (img_src_value = /*client*/ ctx[1].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "client us-none br-p50 w-v10 m-l2 svelte-gzmpi0");
    			add_location(img, file$a, 13, 12, 414);
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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(13:8) {#each clientList as client}",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Page {...pageInfo}>
    function create_default_slot$5(ctx) {
    	let div;
    	let each_value = ClientsList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "flex-row--tc w-max-n1 m-auto flex--wrap");
    			add_location(div, file$a, 11, 4, 311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clientList*/ 0) {
    				each_value = ClientsList;
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
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function create_fragment$a(ctx) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clients", slots, []);

    	const pageInfo = {
    		headerText: "Our Clientele",
    		text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor in."
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clients",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/TopBar.svelte generated by Svelte v3.31.2 */
    const file$b = "src/components/TopBar.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (75:8) {#each links as link}
    function create_each_block$6(ctx) {
    	let a;
    	let h2;
    	let t0_value = /*link*/ ctx[8] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			a = element("a");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(h2, "class", "font_header-secondary");
    			add_location(h2, file$b, 76, 16, 2088);
    			attr_dev(a, "href", "#our_" + /*link*/ ctx[8].toLowerCase());
    			add_location(a, file$b, 75, 12, 2035);
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(75:8) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if mediaManager.active < mediaManager.breaks[3] && !open}
    function create_if_block$3(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Open";
    			add_location(button, file$b, 82, 12, 2300);
    			attr_dev(div, "class", "button-surface absolute svelte-18jic2i");
    			add_location(div, file$b, 81, 8, 2250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
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
    		source: "(81:4) {#if mediaManager.active < mediaManager.breaks[3] && !open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let div1_class_value;
    	let t1;
    	let div2_class_value;
    	let each_value = /*links*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	let if_block = mediaManager.active < mediaManager.breaks[3] && !/*open*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(img, "class", "pt-n3 svelte-18jic2i");
    			if (img.src !== (img_src_value = "./spin_logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "SPIN Logo");
    			add_location(img, file$b, 71, 24, 1839);
    			attr_dev(a, "href", "#home");
    			add_location(a, file$b, 71, 8, 1823);
    			attr_dev(div0, "class", "logo-box relative m-auto svelte-18jic2i");
    			add_location(div0, file$b, 70, 4, 1776);
    			attr_dev(div1, "class", div1_class_value = "of-hidden w-v90 m-auto " + /*linkFlex*/ ctx[2] + " svelte-18jic2i");
    			set_style(div1, "height", /*linkHeight*/ ctx[3]);
    			add_location(div1, file$b, 73, 4, 1916);
    			attr_dev(div2, "class", div2_class_value = "top-bar-surface sticky p-l1 " + /*barFlex*/ ctx[1] + " svelte-18jic2i");
    			add_location(div2, file$b, 69, 0, 1720);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 16) {
    				each_value = /*links*/ ctx[4];
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

    			if (dirty & /*linkFlex*/ 4 && div1_class_value !== (div1_class_value = "of-hidden w-v90 m-auto " + /*linkFlex*/ ctx[2] + " svelte-18jic2i")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*linkHeight*/ 8) {
    				set_style(div1, "height", /*linkHeight*/ ctx[3]);
    			}

    			if (mediaManager.active < mediaManager.breaks[3] && !/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*barFlex*/ 2 && div2_class_value !== (div2_class_value = "top-bar-surface sticky p-l1 " + /*barFlex*/ ctx[1] + " svelte-18jic2i")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
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
    	validate_slots("TopBar", slots, []);
    	let open = false;
    	let barFlex;
    	let linkSize;
    	let linkFlex;
    	let linkHeight = "";
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
    		: "flex-row--cc flex--space-around");

    		linkSize = "2vw";

    		if (mediaManager.active < breaks[2]) {
    			linkSize = "4vw";
    		} else if (mediaManager.active < breaks[3]) {
    			linkSize = "3vw";
    		}

    		if (mediaManager.active < mediaManager.breaks[2] && !open) {
    			$$invalidate(3, linkHeight = 0);
    		} else {
    			$$invalidate(3, linkHeight = "");
    		}

    		if (mediaManager.active < mediaManager.breaks[3] && !open) {
    			$$invalidate(3, linkHeight = 0);
    		} else {
    			$$invalidate(3, linkHeight = "");
    		}
    	}

    	mediaManager.addEventListener("change", () => {
    		determineDynamicStyles();
    	});

    	const links = ["Mission", "Capabilities", "Platforms", "Team", "Work", "Clientele"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, open = true);

    	$$self.$capture_state = () => ({
    		mediaManager,
    		onMount,
    		open,
    		barFlex,
    		linkSize,
    		linkFlex,
    		linkHeight,
    		determineDynamicStyles,
    		links
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("barFlex" in $$props) $$invalidate(1, barFlex = $$props.barFlex);
    		if ("linkSize" in $$props) linkSize = $$props.linkSize;
    		if ("linkFlex" in $$props) $$invalidate(2, linkFlex = $$props.linkFlex);
    		if ("linkHeight" in $$props) $$invalidate(3, linkHeight = $$props.linkHeight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			 {
    				if (mediaManager.active < mediaManager.breaks[3] && !open) {
    					$$invalidate(3, linkHeight = 0);
    				} else {
    					$$invalidate(3, linkHeight = "");
    				}
    			}
    		}
    	};

    	return [open, barFlex, linkFlex, linkHeight, links, click_handler];
    }

    class TopBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopBar",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$c = "src/App.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let topbar;
    	let t1;
    	let div1;
    	let t2;
    	let parallaxscreen;
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
    	parallaxscreen = new ParallaxScreen({ $$inline: true });
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
    	const testimonial1_spread_levels = [TESTIMONIALS[4]];
    	let testimonial1_props = {};

    	for (let i = 0; i < testimonial1_spread_levels.length; i += 1) {
    		testimonial1_props = assign(testimonial1_props, testimonial1_spread_levels[i]);
    	}

    	testimonial1 = new Testimonial({
    			props: testimonial1_props,
    			$$inline: true
    		});

    	platforms = new Platforms({ $$inline: true });
    	const testimonial2_spread_levels = [TESTIMONIALS[1]];
    	let testimonial2_props = {};

    	for (let i = 0; i < testimonial2_spread_levels.length; i += 1) {
    		testimonial2_props = assign(testimonial2_props, testimonial2_spread_levels[i]);
    	}

    	testimonial2 = new Testimonial({
    			props: testimonial2_props,
    			$$inline: true
    		});

    	team = new Team({ $$inline: true });
    	const testimonial3_spread_levels = [TESTIMONIALS[2]];
    	let testimonial3_props = {};

    	for (let i = 0; i < testimonial3_spread_levels.length; i += 1) {
    		testimonial3_props = assign(testimonial3_props, testimonial3_spread_levels[i]);
    	}

    	testimonial3 = new Testimonial({
    			props: testimonial3_props,
    			$$inline: true
    		});

    	work = new Work({ $$inline: true });
    	const testimonial4_spread_levels = [TESTIMONIALS[3]];
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
    			div0 = element("div");
    			t0 = space();
    			create_component(topbar.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			create_component(parallaxscreen.$$.fragment);
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
    			attr_dev(div0, "id", "home");
    			add_location(div0, file$c, 22, 4, 813);
    			attr_dev(div1, "id", "our_mission");
    			attr_dev(div1, "class", "mission absolute svelte-1y8p1d8");
    			add_location(div1, file$c, 24, 4, 853);
    			add_location(main, file$c, 21, 0, 802);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t0);
    			mount_component(topbar, main, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(main, t2);
    			mount_component(parallaxscreen, main, null);
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
    			? get_spread_update(testimonial1_spread_levels, [get_spread_object(TESTIMONIALS[4])])
    			: {};

    			testimonial1.$set(testimonial1_changes);

    			const testimonial2_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial2_spread_levels, [get_spread_object(TESTIMONIALS[1])])
    			: {};

    			testimonial2.$set(testimonial2_changes);

    			const testimonial3_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial3_spread_levels, [get_spread_object(TESTIMONIALS[2])])
    			: {};

    			testimonial3.$set(testimonial3_changes);

    			const testimonial4_changes = (dirty & /*testimonials*/ 0)
    			? get_spread_update(testimonial4_spread_levels, [get_spread_object(TESTIMONIALS[3])])
    			: {};

    			testimonial4.$set(testimonial4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topbar.$$.fragment, local);
    			transition_in(parallaxscreen.$$.fragment, local);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	console.log("!!!");

    	onMount(() => {
    		handleUpdateBaseFont();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		testimonials: TESTIMONIALS,
    		onMount,
    		ParallaxScreen,
    		Testimonial,
    		handleUpdateBaseFont,
    		Capabilities,
    		Platforms,
    		Team,
    		Footer,
    		Work,
    		Clients,
    		TopBar
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
