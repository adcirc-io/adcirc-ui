
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

export { button }