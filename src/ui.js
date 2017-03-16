import { slider } from './slider'

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

export { ui }