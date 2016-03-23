/*!
 * jQuery scrollwatch 0.1.0
 * https://github.com/daedam/jquery-scrollwatch
 *
 * Copyright (c) 2016 Adam Hall
 *
 * Released under the MIT license:
 * https://github.com/daedam/jquery-scrollwatch/blob/master/LICENSE
 */
(function ($) {
    var plugInName = 'scrollwatch',
        defaults = {
            vertical: true,
            horizontal: false,
            addClasses: true,
            targetForClasses: null, // null for same element, or selector
            classPrefix: 'sw',
            classOverrides: {}
        },
        tracked = [];

    function location(pos) {
        if (pos.length < 2) return 'off';
        if (pos.match(/[<>]/)) return 'partial';
        if (pos.length > 2) return 'overflow';
        return 'on';
    }

    function direction(pos, isHorizontal) {
        var a = [['top', 'bottom'], ['left', 'right']],
            b = isHorizontal ? 1 : 0,
            c = pos.match(/^</) ? 0 : (pos.match(/>$/) ? 1 : 2);
        return a[b][c] || '';
    }

    function getClass(pos, isHorizontal, opts) {
        var dir = direction(pos),
            axis = pos.match(/[<>]/) ? '' : (isHorizontal ? 'horizontal' : 'vertical'),
            r = [location(pos)],
            nameNoPrefix, name, override;
        if (dir) r.push(dir);
        if (axis) r.push(axis);
        nameNoPrefix = r.join('-');
        if (opts.classPrefix) r.unshift(opts.classPrefix);
        name = r.join('-');
        if ($.isPlainObject(opts.classOverrides)) {
            name = opts.classOverrides[name] || opts.classOverrides[nameNoPrefix] || name;
        }
        return name;
    }

    function allClasses(opts) {
        var a = ['<', '>', '---', '<-', '->', '--'], c = [], i, j;
        for (i = 0; i <= 1; i++) {
            for (j = 0; j < a.length; j++) {
                c.push(getClass(a[j], i, opts));
            }
        }
        return c.join(' ');
    }

    function getPosition(rect, isHorizontal) {
        var h = isHorizontal,
            dim = h ? 'Width' : 'Height',
            size = window['inner' + dim] || document.documentElement['client' + dim],
            lower = rect[direction('<', h)],
            upper = rect[direction('>', h)];
        if (upper <= 0) return '<';
        if (lower >= size) return '>';
        if (lower < 0 && upper > size) return '---';
        if (lower < 0 && upper >= 0) return '<-';
        if (upper > size && lower < size) return '->';
        return '--';
    }

    function track($element, options) {
        var obj = { $element: $element, options: options, classes: allClasses(options) };
        tracked.push(obj);
        return obj;
    }

    function forget(obj) {
        var i;
        for (i = 0; i < tracked.length; i++) {
            if (tracked[i] === obj) {
                tracked.splice(i, 1);
                obj.$element = null;
                break;
            }
        }
    }

    // Set up jQuery plug-in
    $.fn[plugInName] = function(options) {
        options = $.extend({}, $.fn[plugInName].defaults, options);
        this.each(function () {
            var $me = $(this),
                instance = $.data(this, plugInName);
            if (instance) {
                instance.options = options;
            } else {
                $.data(this, plugInName, track($me, options));
                $me.on('remove', $.proxy(function () {
                    $.removeData(this, plugInName);
                    forget(instance);
                }, this));
            }
        });
        return this;
    };

    // Set plug-in defaults
    $.fn[plugInName].defaults = defaults;

    // Monitor window events
    $(window).on('DOMContentLoaded load resize scroll', function(e) {
        $.each(tracked, function(index, value) {
            var $me = value.$element,
                opts = value.options,
                elt = $me[0],
                $classTarget = opts.targetForClasses ? $(targetForClasses) : $me,
                classNames = [],
                updated = 0,
                pos;

            if (elt) {
                // pull the element from the jQuery object, get its bounding rectangle
                rect = elt.getBoundingClientRect();
                if (opts.vertical) {
                    pos = getPosition(rect, 0);
                    updated += pos !== value.posY ? 1 : 0;
                    value.posY = pos;
                    classNames.push(getClass(pos, 0, opts));
                }
                if (opts.horizontal) {
                    pos = getPosition(rect, 1);
                    updated += pos !== value.posY ? 1 : 0;
                    value.posY = pos;
                    classNames.push(getClass(pos, 1, opts));
                }
                if (updated > 0) {
                    if (opts.addClasses) {
                        $classTarget
                            .removeClass(value.classes)
                            .addClass(classNames.join(' '));
                        $me.trigger(plugInName + '.change', e);
                    }
                    return false;
                }
            }
        });
    });

}(window.jQuery));
