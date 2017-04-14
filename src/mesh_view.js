import { dispatcher } from '../../adcirc-events/index'
import { mesh } from '../../adcirc-mesh/index'

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

export { mesh_view }