import { button } from './button'
import { slider } from './slider'
import { progress } from './progress'
import { gradient } from './gradient'

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

            _ui[ _id ] = gradient()( _gradient );

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

export { ui }