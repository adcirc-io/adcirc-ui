// https://github.com/atdyer/adcirc-ui Version 0.0.1. Copyright 2017 Tristan Dyer.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.adcirc = global.adcirc || {})));
}(this, (function (exports) { 'use strict';

function slider () {

    var _selection;
    var _bar;

    var _arrows = 'topbottom';
    var _bar_color = 'dimgray';
    var _color = 'lightgray';
    var _current = 0;
    var _width;
    var _height = 20;

    var _drag = d3.drag().on( 'drag', dragged );

    var _value_to_value = d3.scaleQuantize();
    var _value_to_percent = d3.scaleLinear().range( [0, 100] );
    var _pixel_to_value = d3.scaleLinear();

    function _slider ( selection ) {

        // Setup
        _selection = selection
            .style( 'position', 'relative' )
            .style( 'width', '100%' )
            .style( 'margin-top', '4px' )
            .style( 'margin-bottom', '4px' );

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
            .style( 'cursor', 'pointer' )
            .call( _drag );

        // Scales
        _width = _selection.node().getBoundingClientRect().width;
        _pixel_to_value.domain( [ 0, _width ] );

        // Events
        _selection.on( 'wheel', scrolled );

        // Initialize
        _slider.arrows( _arrows );
        _slider.bar_color( _bar_color );
        _slider.color( _color );
        _slider.domain( [0,100] );
        _slider.height( _height );

        return _slider;

    }

    _slider.arrows = function ( _ ) {
        if ( !arguments.length ) return _arrows;
        if ( _ == 'top' || _ == 'bottom' || _ == 'topbottom' || _ == 'none' ) {
            _arrows = _;
            if ( _bar ) {
                switch ( _arrows ) {

                    case 'topbottom':
                        _bar.style( 'border-color', _bar_color + ' transparent ' + _bar_color + ' transparent' );
                        break;

                    case 'top':
                        _bar.style( 'border-color', _bar_color + ' transparent transparent transparent' );
                        break;

                    case 'bottom':
                        _bar.style( 'border-color', 'transparent transparent ' + _bar_color + ' transparent' );
                        break;

                    case 'none':
                        _bar.style( 'border-color', 'transparent transparent transparent transparent' );
                        break;

                }
            }
        }
        return _slider;
    };

    _slider.bar_color = function ( _ ) {
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

    _slider.current = function ( _ ) {
        if ( !arguments.length ) return _current;
        _current = _value_to_value( _ );
        if ( _bar ) _bar.style( 'left', _value_to_percent( _current ) + '%' );
        console.log( _current );
        return _slider;
    };

    _slider.domain = function ( _ ) {
        if ( !arguments.length ) return _value_to_percent.domain();

        var _range = [];
        var _step = arguments.length == 2 ? arguments[1] : 1;
        for ( var i=_[0]; i<=_[1]; i+=_step ) _range.push( i );

        _value_to_value.domain( _ ).range( _range );
        _value_to_percent.domain( _ );
        _pixel_to_value.range( _ );

        return _slider;
    };

    _slider.height = function ( _ ) {
        if ( !arguments.length ) return _height;
        _height = _;
        if ( _selection ) _selection.style( 'min-height', _height + 'px' );
        if ( _bar ) _bar.style( 'min-height', _height + 'px' );
        return _slider;
    };

    return _slider;

    function dragged () {

        var pixel = d3.event.x;
        if ( pixel < 0 ) pixel = 0;
        if ( pixel > _width ) pixel = _width;
        var value = _pixel_to_value( pixel );
        _slider.current( value );

    }

    function scrolled () {

        var multiplier = d3.event.shiftKey ? 10 : 1;
        var direction = d3.event.deltaX < 0 || d3.event.deltaY < 0 ? 1 : -1;
        _slider.current( _slider.current() + multiplier * direction );

    }

    

}

function ui ( selection ) {

    var _ui = Object.create( null );

    selection.selectAll( '.slider' )
        .each( function () {

            var _slider = d3.select( this );
            var _id = _slider.attr( 'id' );

            if ( !_id || !!_ui[ _id ] ) {
                console.error( 'All UI components must have a unique ID' );
                return;
            }

            _ui[ _id ] = slider()( column_container( _slider ) );

        });

    return _ui;

    function column_container ( selection ) {

        return selection.append( 'div' )
            .style( 'display', 'flex' )
            .style( 'flex-direction', 'column' );

    }

}

exports.slider = slider;
exports.ui = ui;

Object.defineProperty(exports, '__esModule', { value: true });

})));
