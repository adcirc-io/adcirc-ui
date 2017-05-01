// https://github.com/atdyer/adcirc-ui Version 0.0.1. Copyright 2017 Tristan Dyer.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.adcirc = global.adcirc || {})));
}(this, (function (exports) { 'use strict';

function dispatcher ( object ) {

    object = object || Object.create( null );

    var _listeners = {};
    var _oneoffs = {};

    object.on = function ( type, listener ) {

        if ( !arguments.length ) return object;
        if ( arguments.length == 1 ) return _listeners[ type ];

        if ( _listeners[ type ] === undefined ) {

            _listeners[ type ] = [];

        }

        if ( _listeners[ type ].indexOf( listener ) === - 1 ) {

            _listeners[ type ].push( listener );

        }

        return object;

    };

    object.once = function ( type, listener ) {

        if ( !arguments.length ) return object;
        if ( arguments.length == 1 ) return _oneoffs[ type ];

        if ( _oneoffs[ type ] === undefined ) {

            _oneoffs[ type ] = [];

        }

        if ( _oneoffs[ type ].indexOf( listener ) === - 1 ) {

            _oneoffs[ type ].push( listener );

        }

        return object;

    };

    object.off = function ( type, listener ) {

        var listenerArray = _listeners[ type ];
        var oneoffArray = _oneoffs[ type ];
        var index;

        if ( listenerArray !== undefined ) {

            index = listenerArray.indexOf( listener );

            if ( index !== - 1 ) {

                listenerArray.splice( index, 1 );

            }

        }

        if ( oneoffArray !== undefined ) {

            index = oneoffArray.indexOf( listener );

            if ( index !== -1 ) {

                oneoffArray.splice( index, 1 );

            }

        }

        return object;

    };

    object.dispatch = function ( event ) {

        var listenerArray = _listeners[ event.type ];
        var oneoffArray = _oneoffs[ event.type ];

        var array = [], i, length;

        if ( listenerArray !== undefined ) {

            if ( event.target === undefined )
                event.target = object;

            length = listenerArray.length;

            for ( i = 0; i < length; i ++ ) {

                array[ i ] = listenerArray[ i ];

            }

            for ( i = 0; i < length; i ++ ) {

                array[ i ].call( object, event );

            }

        }

        if ( oneoffArray !== undefined ) {

            if ( event.target === undefined )
                event.target = object;

            length = oneoffArray.length;

            for ( i = 0; i < length; i ++ ) {

                array[ i ] = oneoffArray[ i ];

            }

            for ( i = 0; i < length; i ++ ) {

                array[ i ].call( object, event );

            }

            _oneoffs[ event.type ] = [];

        }

        return object;

    };

    return object;

}

function slider () {

    var _selection;
    var _bar;

    var _arrows = 'both';
    var _bar_color = 'dimgray';
    var _color = 'lightgray';
    var _current = 0;
    var _width;
    var _height = 20;

    var _drag_bar = d3.drag().on( 'drag', dragged );
    var _drag_slider = d3.drag().on( 'start', clicked ).on( 'drag', dragged );
    var _draggable = true;
    var _jumpable = true;
    var _request = false;

    var _continuous = false;
    var _step = 1;
    var _domain = [0, 100];
    var _value_to_value = d3.scaleQuantize();
    var _value_to_percent = d3.scaleLinear().range( [0, 100] ).clamp( true );
    var _pixel_to_value = d3.scaleLinear();

    function _slider ( selection ) {

        // Setup
        _selection = selection
            .style( 'position', 'relative' )
            .style( 'width', '100%' )
            .style( 'margin-top', '4px' )
            .style( 'margin-bottom', '4px' )
            .style( 'user-select', 'none' );

        _bar = _selection
            .selectAll( 'div' )
            .data( [ 'slider_bar' ] );

        _bar.exit()
            .remove();

        _bar = _bar.enter()
            .append( 'div' )
            .merge( _bar );

        _bar.style( 'position', 'relative' )
            .style( 'left', 0 )
            .style( 'width', '1px' )
            .style( 'background-clip', 'content-box' )
            .style( 'margin', '-4px' )
            .style( 'border-width', '4px' )
            .style( 'border-style', 'solid' )
            .style( 'user-select', 'none' );

        // Scales
        _width = _selection.node().getBoundingClientRect().width;
        _pixel_to_value.domain( [ 0, _width ] );

        // Events
        _selection
            .on( 'mousedown', clicked )
            .on( 'wheel', scrolled );

        // Initialize
        _slider.arrows( _arrows );
        _slider.bar( _bar_color );
        _slider.color( _color );
        _slider.domain( _domain );
        _slider.draggable( _draggable );
        _slider.height( _height );
        _slider.jumpable( _jumpable );

        return _slider;

    }

    _slider.arrows = function ( _ ) {
        if ( !arguments.length ) return _arrows;
        if ( _ == 'top' || _ == 'bottom' || _ == 'both' || _ == 'none' ) {
            _arrows = _;
            if ( _bar ) {
                switch ( _arrows ) {

                    case 'both':
                        _bar.style( 'border-color', _bar_color + ' transparent ' + _bar_color + ' transparent' );
                        break;

                    case 'top':
                        _bar.style( 'border-color', _bar_color + ' transparent transparent transparent' );
                        break;

                    case 'bottom':
                        _bar.style( 'border-color', 'transparent transparent ' + _bar_color + ' transparent' );
                        break;

                    default:
                        _bar.style( 'border-color', 'transparent transparent transparent transparent' );
                        break;

                }
            }
        }
        return _slider;
    };

    _slider.bar = function ( _ ) {
        if ( !arguments.length ) return _bar_color;
        _bar_color = _;
        if ( _bar ) {
            _bar.style( 'background-color', _bar_color );
            _slider.arrows( _arrows );
        }
        return _slider;
    };

    _slider.color = function ( _ ) {
        if ( !arguments.length ) return _color;
        _color = _;
        if ( _selection ) _selection.style( 'background-color', _color );
        return _slider;
    };

    _slider.continuous = function ( _ ) {
        return arguments.length ? ( _continuous = !!_, _slider ) : _continuous;
    };

    _slider.current = function ( _ ) {
        return arguments.length ? ( set_current( _ ), _slider ) : _current;
    };

    _slider.domain = function ( _ ) {
        if ( !arguments.length ) return _value_to_percent.domain();

        _domain = _;
        var _range = [];
        _step = arguments.length == 2 ? arguments[1] : 1;
        for ( var i=_[0]; i<=_[1]; i+=_step ) _range.push( i );

        _value_to_value.domain( _ ).range( _range );
        _value_to_percent.domain( _ );
        _pixel_to_value.range( _ );

        return _slider;
    };

    _slider.draggable = function ( _ ) {
        if ( !arguments.length ) return _draggable;
        _draggable = !!_;
        if ( _bar ) {
            if ( !_draggable ) _bar.style( 'cursor', null ).on( '.drag', null );
            else _bar.style( 'cursor', 'pointer' ).call( _drag_bar );
        }
        return _slider;
    };

    _slider.height = function ( _ ) {
        if ( !arguments.length ) return _height;
        _height = _;
        if ( _selection ) _selection.style( 'min-height', _height + 'px' );
        if ( _bar ) _bar.style( 'min-height', _height + 'px' );
        return _slider;
    };

    _slider.jumpable = function ( _ ) {
        if ( !arguments.length ) return _jumpable;
        _jumpable = !!_;
        if ( _selection ) {
            if ( !_jumpable ) _selection.style( 'cursor', null ).on( '.drag', null );
            else _selection.style( 'cursor', 'pointer' ).call( _drag_slider );
        }
        return _slider;
    };

    _slider.needs_request = function ( _ ) {
        if ( !arguments.length ) return _request;
        _request = !!_;
        return _slider;
    };

    _slider.set = function ( value ) {

        set_current( value );

    };

    return dispatcher( _slider );

    function clamp ( value ) {
        var domain = _value_to_percent.domain();
        if ( value < domain[0] ) return domain[0];
        if ( value > domain[1] ) return domain[1];
        return value;
    }

    function clicked () {

        if ( _jumpable ) {
            var pixel = d3.mouse( this )[ 0 ];
            if ( pixel < 0 ) pixel = 0;
            if ( pixel > _width ) pixel = _width;
            var value = _pixel_to_value( pixel );
            if ( set_current( value ) ) dispatch_current();
        }

    }

    function dispatch_current () {

        _slider.dispatch( {
            type: 'value',
            value: _current
        } );

    }

    function dispatch_request ( value ) {

        var request_value = _current;
        if ( value > _current ) request_value += _step;
        if ( value < _current ) request_value -= _step;

        if ( request_value !== _current ) {

            _slider.dispatch( {
                type: 'request',
                value: request_value
            } );

        }

    }

    function dragged () {

        if ( _draggable ) {
            var pixel = d3.event.x;
            if ( pixel < 0 ) pixel = 0;
            if ( pixel > _width ) pixel = _width;
            var value = _pixel_to_value( pixel );
            if ( _request ) dispatch_request( value );
            else if ( set_current( value ) ) dispatch_current();
        }

    }

    function scrolled () {

        if ( _draggable ) {
            var multiplier = d3.event.shiftKey ? 10*_step : _step;
            var direction = d3.event.deltaX < 0 || d3.event.deltaY < 0 ? 1 : -1;
            if ( set_current( _slider.current() + multiplier * direction ) ) dispatch_current();
        }

    }

    function set_current ( value ) {
        value = _continuous ? clamp( value ) : _value_to_value( value );
        if ( value !== _current ) {
            if ( _jumpable ) _current = value;
            else _current = value > _current ? _current + _step : _current - _step;
            if ( _bar ) _bar.style( 'left', _value_to_percent( _current ) + '%' );
            return true;
        }
        return false;
    }

    

}

function button () {

    var _selection;
    var _filepicker;
    var _filepicker_cb;

    function _button ( selection ) {

        _selection = selection;
        _button.file_picker( _filepicker_cb );
        return _button;

    }

    _button.file_picker = function ( _ ) {

        if ( !arguments.length ) return _filepicker;
        if ( typeof _ !== 'function' ) return _button;

        _filepicker_cb = _;

        if ( !_filepicker && _selection ) {

            _filepicker = _selection.append( 'input' )
                .attr( 'type', 'file' )
                .style( 'display', 'none' )
                .on( 'click', function () {
                    d3.event.stopPropagation();
                })
                .on( 'change', function () {
                    if ( typeof _filepicker_cb === 'function' ) {
                        _filepicker_cb( _filepicker.node().files[0] );
                    }
                });

        }

        if ( _selection ) {

            _selection.on( 'click', function () {

                d3.event.preventDefault();
                _filepicker.node().click();

            });

        }

        return _button;

    };

    return _button;

}

function progress () {

    var _selection;
    var _bar;

    var _current = 0;
    var _height = 10;
    var _max = 100;
    var _min = 0;

    var _background_color = 'lightgray';
    var _color = 'steelblue';

    var _value_to_percent = d3.scaleLinear()
        .domain( [_min, _max] )
        .range( [0, 100] )
        .clamp( true );

    function _progress ( selection ) {

        _selection = selection
            .style( 'position', 'relative' )
            .style( 'width', '100%' )
            .style( 'user-select', 'none' );
            // .style( 'display', 'flex' )
            // .style( 'justify-content', 'center' )
            // .style( 'align-items', 'center' )
            // .style( 'font-size', '14px' );

        _bar = _selection
            .selectAll( 'div' )
            .data( [ 'progress_bar' ] );

        _bar.exit()
            .remove();

        _bar = _bar.enter()
            .append( 'div' )
            .merge( _bar );

        _bar.style( 'position', 'relative' )
            .style( 'left', 0 )
            .style( 'width', '0%' )
            .style( 'background-clip', 'content-box' )
            .style( 'user-select', 'none' );

        // Initialize
        _progress.background_color( _background_color );
        _progress.color( _color );
        _progress.height( _height );

        return _progress;

    }

    _progress.background_color = function ( _ ) {

        if ( !arguments.length ) return _background_color;
        _background_color = _;
        if ( _selection ) _selection.style( 'background-color', _background_color );
        return _progress;

    };

    _progress.color = function ( _ ) {

        if ( !arguments.length ) return _color;
        _color = _;
        if ( _bar ) _bar.style( 'background-color', _color );
        return _progress;

    };

    _progress.height = function ( _ ) {

        if ( !arguments.length ) return _height;
        _height = _;
        if ( _selection ) _selection.style( 'min-height', _height + 'px' );
        if ( _bar ) _bar.style( 'min-height', _height + 'px' );
        return _progress;

    };

    _progress.progress = function ( _ ) {

        if ( !arguments.length ) return _current;
        _current = _value_to_percent( _ );
        if ( _bar ) _bar.style( 'width', _current + '%' );
        return _progress;

    };

    return _progress;

}

function vertical_gradient () {

    var _selection;
    var _bar;
    var _track;
    var _sliders;

    var _bar_width = 50;
    var _track_width = 75;
    var _height = 250;

    var _stops = [
        { stop: 0, color: 'lightsteelblue' },
        { stop: 1, color: 'steelblue' }
    ];

    var _percent_to_value = d3.scaleLinear().domain( [ 0, 1 ] ).range( [ 0, 1 ] );
    var _percent_to_pixel = d3.scaleLinear().domain( [ 0, 1 ] ).range( [ _height, 0 ] );


    function _gradient ( selection ) {

        // Keep track of selection that will be the gradient
        _selection = selection;

        // Apply the layout
        layout( _selection );

        // Return the gradient
        return _gradient;

    }

    _gradient.stops = function ( stops, colors ) {

        var extent = d3.extent( stops );

        _percent_to_value.range( extent );

        _stops = [];

        for ( var i=0; i<stops.length; ++i ) {

            _stops.push( { stop: _percent_to_value.invert( stops[i] ), color: colors[i] } );

        }

        _stops = _stops.sort( sort );

        layout( _selection );

        return _gradient;

    };

    function build_css_gradient ( stops ) {

        var css = 'linear-gradient( 0deg, ';

        for ( var i=0; i<stops.length; ++i  ){

            var color = stops[i].color;
            var percent = 100 * stops[i].stop;
            css += color + ' ' + percent + '%';

            if ( i < stops.length-1 ) css += ',';

        }

        return css + ')';

    }

    function dragged ( d ) {

        var y = Math.max( 0, Math.min( _height, d3.event.y ) );

        d3.select( this )
            .style( 'top', y + 'px' );

        d.stop = _percent_to_pixel.invert( y );

        var sorted = _stops.sort( sort );

        _bar.style( 'background', build_css_gradient( sorted ) );
        _sliders.each( slider_text );

        _gradient.dispatch({
            type: 'gradient',
            stops: sorted.map( function ( stop ) { return _percent_to_value( stop.stop ); } ),
            colors: sorted.map( function ( stop ) { return stop.color; } )
        });

    }

    function layout ( selection ) {

        selection
            .style( 'position', 'relative' )
            .style( 'width', ( _bar_width + _track_width ) + 'px' )
            .style( 'user-select', 'none' )
            .style( 'min-height', _height + 'px' );

        _bar = selection
            .selectAll( '.gradient-bar' )
            .data( [ {} ] );

        _bar.exit().remove();

        _bar = _bar.enter()
            .append( 'div' )
            .attr( 'class', 'gradient-bar' )
            .merge( _bar );

        _bar.style( 'position', 'absolute' )
            .style( 'top', 0 )
            .style( 'left', 0 )
            .style( 'width', _bar_width + 'px' )
            .style( 'height', '100%' )
            .style( 'background', build_css_gradient( _stops ) )
            .style( 'user-select', 'none' );

        _track = selection
            .selectAll( '.gradient-track' )
            .data( [ {} ] );

        _track.exit().remove();

        _track = _track.enter()
            .append( 'div' )
            .attr( 'class', 'gradient-track' )
            .merge( _track );

        _track.style( 'position', 'absolute' )
            .style( 'top', 0 )
            .style( 'left', _bar_width + 'px' )
            .style( 'width', _track_width + 'px' )
            .style( 'height', '100%' )
            .style( 'user-select', 'none' );

        position_sliders();

    }

    function position_sliders () {

        _sliders = _track.selectAll( '.slider' )
            .data( _stops );

        _sliders.exit().remove();

        _sliders = _sliders.enter()
            .append( 'div' )
            .attr( 'class', 'slider' )
            .merge( _sliders );

        _sliders
            .style( 'width', '0px' )
            .style( 'height', '1px' )
            .style( 'border-width', '8px' )
            .style( 'border-style', 'solid' )
            .style( 'margin-top', '-8px' )
            .style( 'margin-left', '-8px')
            .style( 'position', 'absolute' )
            .style( 'left', 0 )
            .each( function ( d ) {

                d3.select( this )
                    .style( 'top', ( _height - d.stop * _height ) + 'px' )
                    .style( 'border-color', 'transparent ' + d.color + ' transparent transparent' )
                    .style( 'user-select', 'none' );

            })
            .each( slider_text )
            .call( d3.drag()
                .on( 'drag', dragged )
            );

    }

    function sort ( a, b ) {

        return a.stop > b.stop;

    }

    function slider_text ( d ) {

        var text = d3.select( this )
            .selectAll( 'div' ).data( [ {} ] );

        text.exit().remove();

        text = text.enter()
            .append( 'div' )
            .merge( text );

        text.style( 'position', 'absolute' )
            .style( 'top', '50%' )
            .style( 'left', '8px' )
            .style( 'transform', 'translateY(-50%)' )
            .style( 'padding-left', '4px' )
            .style( 'font-size', '13px' )
            .style( 'font-family', 'serif' )
            .style( 'min-width', ( _track_width - 12 ) + 'px' )
            .style( 'user-select', 'none' )
            .style( 'cursor', 'default' )
            .text( _percent_to_value( d.stop ).toFixed( 5 ) );

    }

    return dispatcher( _gradient );

}

function ui ( selection ) {

    var _ui = Object.create( null );

    selection.selectAll( '.adc-slider' )
        .each( function () {

            var _slider = d3.select( this );
            var _id = _slider.attr( 'id' );

            if ( exists( _id ) ) {
                return unique_error();
            }

            _ui[ _id ] = slider()( column_container( _slider ) );

        });

    selection.selectAll( '.adc-button' )
        .each( function () {

            var _button = d3.select( this );
            var _id = _button.attr( 'id' );

            if ( exists( _id ) ) {
                return unique_error();
            }

            _ui[ _id ] = button()( _button );

        });

    selection.selectAll( '.adc-progress' )
        .each( function () {

            var _progress = d3.select( this );
            var _id = _progress.attr( 'id' );

            if ( exists( _id ) ) {
                return unique_error();
            }

            _ui[ _id ] = progress()( _progress );

        });

    selection.selectAll( '.adc-gradient' )
        .each( function () {

            var _gradient = d3.select( this );
            var _id = _gradient.attr( 'id' );

            if ( exists( _id ) ) {
                return unique_error();
            }

            _ui[ _id ] = vertical_gradient()( _gradient );

        });

    return _ui;

    function column_container ( selection ) {

        return selection.append( 'div' )
            .style( 'display', 'flex' )
            .style( 'flex-direction', 'column' );

    }

    function exists ( id ) {

        return !id || !!_ui[ id ];

    }

    function unique_error () {
        console.error( 'All UI components must have a unique ID' );
    }

}

function mesh_view ( m ) {

    var _mesh = m;
    var _view = dispatcher();

    var _name;

    _view.bounding_box = function () {

        return _mesh.bounding_box();

    };

    _view.mesh = function () {

        return _mesh;

    };

    _view.name = function ( _ ) {

        if ( !arguments.length ) return _name;
        _name = _;
        _view.dispatch({
            type: 'modify',
            target: _mesh,
            property: 'name',
            name: _name
        });
        return _view;

    };

    _view.select = function () {

        _view.dispatch({
            type: 'select',
            target: _mesh
        });

    };


    // Bubble events
    _mesh.on( 'bounding_box', _view.dispatch );
    _mesh.on( 'elemental_value', _view.dispatch );
    _mesh.on( 'nodal_value', _view.dispatch );


    return _view;

}

exports.slider = slider;
exports.button = button;
exports.progress = progress;
exports.gradient = vertical_gradient;
exports.ui = ui;
exports.mesh_view = mesh_view;

Object.defineProperty(exports, '__esModule', { value: true });

})));
