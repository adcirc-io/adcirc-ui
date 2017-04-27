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

export { progress }