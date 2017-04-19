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

    var _continuous = false;
    var _step = 1;
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
        _slider.domain( [0,100] );
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

    function dragged () {

        if ( _draggable ) {
            var pixel = d3.event.x;
            if ( pixel < 0 ) pixel = 0;
            if ( pixel > _width ) pixel = _width;
            var value = _pixel_to_value( pixel );
            if ( set_current( value ) ) dispatch_current();
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

function horizontal_gradient () {

    var _selection;
    var _canvas;
    var _height = 50;
    var _width;

    var _values = [ 0, 1 ];
    var _percentages = [ 0, 1 ];
    var _stop_pixels;
    var _colors = [ 'lightsteelblue', 'steelblue' ];

    var _percent_to_color = d3.scaleLinear().domain( [ 0, 1 ] ).range( _colors );
    var _percent_to_pixel = d3.scaleLinear().domain( [ 0, 1 ] );
    var _percent_to_value = d3.scaleLinear().domain( [ 0, 1 ] ).range( _values );

    var hover_size = 7;
    var dragging = null;

    var _white = d3.rgb( 'white' );
    var _black = d3.rgb( 'black' );

    function _gradient ( selection ) {

        // Keep track of selection that will be the gradient
        _selection = selection;

        // Apply the top level layout to the selection
        layout( _selection );

        // Initialize stops
        update_stops();

        // Set up dragging
        _canvas.call( d3.drag()
            .on( 'start', clicked )
            .on( 'drag', dragged )
            .on( 'end', released )
        );

        // Initial render
        _canvas.each( render );

        // Return the gradient
        return _gradient;

    }

    _gradient.height = function ( _ ) {

        if ( !arguments.length ) return _height;
        _height = _;
        layout( _selection );
        return _gradient;

    };

    _gradient.stops = function ( values, colors ) {

        _values = values;
        _colors = colors;

        _percent_to_value = d3.scaleLinear()
            .domain( [ 0, 1 ] )
            .range( [ values[ 0 ], values[ values.length - 1 ] ] );

        update_stops();

        _canvas.each( render );

        return _gradient;

    };

    return dispatcher( _gradient );


    function clicked () {

        var x = d3.mouse( this )[ 0 ];
        var slider = get_slider( x );

        if ( slider && slider !== _values.length - 1 ) {

            dragging = slider;

        } else {

            dragging = null;

        }

    }

    function dragged () {

        // Get mouse location
        var x = Math.max( 0, Math.min( this.width - 1, d3.mouse( this )[ 0 ] ) );

        // Move slider
        if ( dragging !== null ) {
            move_slider( dragging, x );
            update_stops();
        }

        // Render
        _canvas.each( render );

    }

    function get_slider ( x ) {

        for ( var i = 0; i < _percentages.length; ++i ) {

            var pixel = _percent_to_pixel( _percentages[ i ] );
            if ( x > pixel - hover_size && x < pixel + hover_size ) {

                return i;

            }

        }

    }

    function hover () {

        var x = d3.mouse( this )[ 0 ];

        for ( var i = 1; i < _percentages.length - 1; ++i ) {

            var pixel = _percent_to_pixel( _percentages[ i ] );
            if ( x > pixel - hover_size && x < pixel + hover_size ) {

                _canvas.style( 'cursor', 'pointer' );
                return;

            }

        }

        _canvas.style( 'cursor', null );

    }

    function layout ( selection ) {

        selection
            .style( 'height', _height + 'px' )
            .style( 'user-select', 'none' );

        _canvas = selection.selectAll( 'canvas' )
            .data( [ {} ] );

        _canvas.exit()
            .remove();

        _canvas = _canvas
            .enter()
            .append( 'canvas' )
            .merge( _canvas );

        _canvas
            .style( 'width', '100%' )
            .style( 'height', _height + 'px' )
            .on( 'mousemove', hover );

        _canvas
            .property( 'width', parseFloat( _canvas.style( 'width' ) ) )
            .property( 'height', 1 );

    }

    function move_slider ( i, x ) {

        var percent = _percent_to_pixel.invert( x );
        var value = _percent_to_value( percent );

        if ( value > _values[ i + 1 ] ) {

            _values[ i ] = _values[ i + 1 ];
            _values[ i + 1 ] = value;
            var color = _colors[ i ];
            _colors[ i ] = _colors[ i + 1 ];
            _colors[ i + 1 ] = color;
            dragging = i + 1;

        } else if ( value < _values[ i - 1 ] ) {

            _values[ i ] = _values[ i - 1 ];
            _values[ i - 1 ] = value;
            var color = _colors[ i ];
            _colors[ i ] = _colors[ i - 1 ];
            _colors[ i - 1 ] = color;
            dragging = i - 1;

        } else {

            _values[ i ] = value;

        }

    }

    function released () {

        dragging = null;

    }

    function render () {

        var width = parseFloat( d3.select( this ).style( 'width' ) );
        var context = this.getContext( '2d' );
        var image = context.createImageData( width, 1 );
        var i = -1;
        var color;

        var next_stop = 0;

        for ( var x = 0; x < width; ++x ) {

            if ( x === _stop_pixels[ next_stop ] ) {

                color = _white;
                next_stop += 1;

            } else if ( x === _stop_pixels[ next_stop ] - 1 ) {

                color = _black;

            } else {

                color = d3.rgb( _percent_to_color( x / width ) );

            }

            image.data[ ++i ] = color.r;
            image.data[ ++i ] = color.g;
            image.data[ ++i ] = color.b;
            image.data[ ++i ] = 255;

        }

        context.putImageData( image, 0, 0 );

    }

    function update_stops () {

        _percentages = _values.map( function ( value ) {

            return _percent_to_value.invert( value );

        } );

        _width = parseFloat( _canvas.style( 'width' ) );

        _percent_to_color = d3.scaleLinear()
            .domain( _percentages )
            .range( _colors );

        _percent_to_pixel = d3.scaleLinear()
            .domain( [ _percentages[ 0 ], _percentages[ _percentages.length - 1 ] ] )
            .range( [ 0, _width ] );

        _stop_pixels = [];

        for ( var i = 0; i < _percentages.length; ++i ) {

            _stop_pixels.push( Math.round( _percent_to_pixel( _percentages[ i ] ) ) );

        }

        _gradient.dispatch({
            type: 'gradient',
            stops: _values,
            colors: _colors
        });

    }

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

            _ui[ _id ] = horizontal_gradient()( _gradient );

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
exports.ui = ui;
exports.mesh_view = mesh_view;

Object.defineProperty(exports, '__esModule', { value: true });

})));
