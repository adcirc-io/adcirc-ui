import { button } from './button'
import { slider } from './slider'

function ui ( selection ) {

    var _ui = Object.create( null );

    selection.selectAll( '.adc-slider' )
        .each( function () {

            var _slider = d3.select( this );
            var _id = _slider.attr( 'id' );

            if ( !_id || !!_ui[ _id ] ) {
                return unique_error();
            }

            _ui[ _id ] = slider()( column_container( _slider ) );

        });

    selection.selectAll( '.adc-button' )
        .each( function () {

            var _button = d3.select( this );
            var _id = _button.attr( 'id' );

            if ( !_id || !!_ui[ _id ] ) {
                return unique_error();
            }

            _ui[ _id ] = button()( _button );

        });

    return _ui;

    function column_container ( selection ) {

        return selection.append( 'div' )
            .style( 'display', 'flex' )
            .style( 'flex-direction', 'column' );

    }

    function unique_error () {
        console.error( 'All UI components must have a unique ID' );
    }

}

export { ui }