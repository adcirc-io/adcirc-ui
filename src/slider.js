import { dispatcher } from '../../adcirc-events/index'

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

    function width () {
        return _selection.node().getBoundingClientRect().width;
    }

}

export { slider }