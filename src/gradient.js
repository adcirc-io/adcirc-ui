import { dispatcher } from '../../adcirc-events/index'

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

export { horizontal_gradient as gradient }