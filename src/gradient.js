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

    var _percent_to_color;
    var _percent_to_pixel;

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
        _canvas.call( d3.drag().on( 'drag', dragged ) );

        // Initial render
        _canvas.each( render );

        // Return the gradient
        return _gradient;

    }

    _gradient.stops = function ( values, colors ) {

        _values = values;
        _colors = colors;

        calculate_percentages();
        update_stops();

        _canvas.each( render );

    };

    return _gradient;


    function calculate_percentages () {

        _percentages = _values.map( percentage );

    }

    function percentage ( value ) {

        return ( value - _values[0] ) / ( _values[ _values.length - 1 ] - _values[0] );

    }

    function dragged( d ) {

        d.mouse = Math.max( 0, Math.min( this.width - 1, d3.mouse(this)[0] ) );
        _canvas.each( render );

    }

    function layout ( selection ) {

        selection
            .style( 'height', _height + 'px' )
            .style( 'user-select', 'none' );

        _canvas = selection.selectAll( 'canvas' )
            .data( [{}] );

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

    function update_stops () {

        _width = parseFloat( _canvas.style( 'width' ) );

        _percent_to_color = d3.scaleLinear()
            .domain( _percentages )
            .range( _colors );

        _percent_to_pixel = d3.scaleLinear()
            .domain( [ _percentages[0], _percentages[ _percentages.length - 1] ] )
            .range( [ 0, _width ] );

        _stop_pixels = [];

        for ( var i=0; i<_percentages.length; ++i ) {

            _stop_pixels.push( _percent_to_pixel( _percentages[i] ) );

        }

    }

    function hover () {

        var x = d3.mouse( this )[ 0 ];

        for ( var i=0; i<_percentages.length; ++i ) {

            var pixel = _percent_to_pixel( _percentages[i] );
            if ( x > pixel - 5 && x < pixel + 5 ) {

                _canvas.style( 'cursor', 'pointer' );
                return;

            }

        }

        _canvas.style( 'cursor', null );

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


}

function gradient () {

    var _selection;
    var _canvas;
    var _stops;

    var _value_to_pixel = d3.scaleLinear();
    var _scale = d3.interpolateCool;

    var _orientation = 'horizontal';
    var _dimension = 50;

    function _gradient ( selection ) {

        _selection = orient_horizontal( selection, _dimension );

        _canvas = _selection.selectAll( 'canvas' )
            .data( [ 'gradient_canvas' ] );

        _canvas.exit()
            .remove();

        _canvas = _canvas.enter()
            .append( 'canvas' )
            .merge( _canvas )
            .style( 'width', '100%' )
            .style( 'height', _dimension + 'px' );

        _canvas
            .property( 'width', parseFloat( _canvas.style( 'width' ) ) )
            .property( 'height', 1 );

        _canvas
            .each( render );

        return _gradient;

    }

    _gradient.bounds = function ( min, max ) {

        _value_to_pixel.domain( [min, max] );
        return _gradient;

    };

    _gradient.stops = function ( _ ) {

        if ( !arguments.length ) return _stops;

        _stops = _selection.selectAll( '.stop' )
            .data( _ );

        _stops.exit().remove();

        _stops = _stops.enter()
            .append( 'div' )
            .attr( 'class', 'stop' )
            .merge( _stops );

        _stops.each( position_stop );

        return _gradient;

    };

    return _gradient;


    function orient_horizontal ( selection, height ) {

        return selection
            .style( 'position', 'relative' )
            .style( 'width', '900px' )
            .style( 'height', height + 'px' )
            .style( 'user-select', 'none' );

    }

    function orient_vertical ( selection, width ) {

    }

    function position_stop ( d ) {

        if ( _orientation === 'horizonal ' ) {

            var stop = d3.select( this )
                .style( 'position', 'relative' )
                .style( 'top', 0 )
                .style( 'left', d + 'px' );

        }

    }

    function render ( d ) {

        if ( _orientation === 'horizontal' ) {

            var width = parseFloat( d3.select( this ).style( 'width' ) );
            var context = this.getContext( '2d' );
            var image = context.createImageData( width, 1 );
            var i = -1;
            var linear = d3.scaleLinear().domain([0, width]).range([0, 1]);

            for ( var x=0; x<width; ++x ) {

                var color = d3.rgb( _scale( linear( x )  ) );
                image.data[++i] = color.r;
                image.data[++i] = color.g;
                image.data[++i] = color.b;
                image.data[++i] = 255;

            }

            context.putImageData( image, 0, 0 );

        }

    }

}

export { horizontal_gradient as gradient }