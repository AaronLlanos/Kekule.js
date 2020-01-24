/**
 * @fileoverview
 * Implementation of line based glyphs defined by a series of nodes and paths.
 * @author Partridge Jiang
 */

/*
 * requires /lan/classes.js
 * requires /core/kekule.common.js
 * requires /core/kekule.structures.js
 * requires /chemdoc/kekule.glyph.base.js
 * requires /chemdoc/kekule.glyph.pathGlyphs.js
 */

var Class = require('../lan/classes').Class
var ClassEx = require('../lan/classes').ClassEx
var DataType = require('../lan/classes').DataType
module.exports = function(Kekule){

var NT = Kekule.Glyph.NodeType;
var PT = Kekule.Glyph.PathType;
var CU = Kekule.CoordUtils;
var CM = Kekule.CoordMode;

/**
 * A glyph of straight line.
 * @class
 * @augments Kekule.Glyph.PathGlyph
 */
Kekule.Glyph.StraightLine = Class.create(Kekule.Glyph.PathGlyph,
/** @lends Kekule.Glyph.StraightLine# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Glyph.StraightLine',
	/** @constructs */
	initialize: function($super, id, refLength, initialParams, coord2D, coord3D)
	{
		$super(id, refLength, initialParams, coord2D, coord3D);
	},
	/** @private */
	doCreateDefaultStructure: function(refLength, initialParams)
	{
		// initialParams can include additional field: lineLength
		var C = Kekule.CoordUtils;

		var coord2D = {'x': 0, 'y': 0};
		var coord3D = {'x': 0, 'y': 0, 'z': 0};
		var delta = {'x': refLength * (initialParams.lineLength || 1)};
		var node1 = new Kekule.Glyph.PathGlyphNode(null, null, coord2D, coord3D);
		var node2 = new Kekule.Glyph.PathGlyphNode(null, null, C.add(coord2D, delta), C.add(coord3D, delta));
		var connector = new Kekule.Glyph.PathGlyphConnector(null, PT.LINE, [node1, node2]);
		this._applyParamsToConnector(connector, initialParams);
		this.appendNode(node1);
		this.appendNode(node2);
		this.appendConnector(connector);
	},
	/** @private */
	_applyParamsToConnector: function(connector, initialParams)
	{
		//connector.setPathParams(initialParams);

		var p = Object.create(initialParams);
		if (Kekule.ObjUtils.isUnset(initialParams.autoOffset))
			p.autoOffset = false;
		connector.setPathParams(p);
	}
	/* @ignore */
	/*
	getAllowChildCoordStickTo: function(child, dest)
	{
		return true;
	},
	*/
	/* @ignore */
	/*
	getChildAcceptCoordStickFrom: function(child, fromObj)
	{
		return true;
	}
	*/
});

/**
 * A glyph of polygon formed by straight lines.
 * @class
 * @augments Kekule.Glyph.PathGlyph
 */
Kekule.Glyph.Polygon = Class.create(Kekule.Glyph.PathGlyph,
/** @lends Kekule.Glyph.Polygon# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Glyph.Polygon',
	/** @constructs */
	initialize: function($super, id, refLength, initialParams, coord2D, coord3D)
	{
		$super(id, refLength, initialParams, coord2D, coord3D);
	},
	/** @private */
	getRefLengthRatio: function()
	{
		return 1;
	},
	/** @private */
	doCreateDefaultStructure: function(refLength, initialParams)
	{
		// initialParams can include additional field: lineLength, edgeCount
		//   node props, connector props
		var C = Kekule.CoordUtils;
		var coord2D = {'x': 0, 'y': 0};
		var coord3D = {'x': 0, 'y': 0, 'z': 0};
		var nodeProps = initialParams.nodeProps;
		var connectorProps = initialParams.connectorProps;
		var r = refLength * (initialParams.lineLength || 1) * this.getRefLengthRatio();
		var edgeCount = initialParams.edgeCount || 3;
		var angleDelta = Math.PI * 2 / edgeCount;
		var startingAngle = (edgeCount % 2)?0: -angleDelta / 2;
		var currAngle = startingAngle;
		var firstNode, lastNode;
		for (var i = 0; i < edgeCount; ++i)
		{
			var c = {'x': r * Math.sin(currAngle), 'y': r * Math.cos(currAngle)};
			var node = new Kekule.Glyph.PathGlyphNode(null, null, C.add(coord2D, c), C.add(coord3D, c));
			if (nodeProps)
				node.setPropValues(nodeProps);
			this.appendNode(node);
			if (i === 0)
				firstNode = node;
			if (lastNode)
			{
				var connector = new Kekule.Glyph.PathGlyphConnector(null, PT.LINE, [lastNode, node]);
				if (connectorProps)
					connector.setPropValues(connectorProps);
				this._applyParamsToConnector(connector, initialParams);
				this.appendConnector(connector);
			}
			lastNode = node;
			currAngle += angleDelta;
		}
		var connector = new Kekule.Glyph.PathGlyphConnector(null, PT.LINE, [node, firstNode]);
		if (connectorProps)
			connector.setPropValues(connectorProps);
		this._applyParamsToConnector(connector, initialParams);
		this.appendConnector(connector);
	},
	/** @private */
	_applyParamsToConnector: function(connector, initialParams)
	{
		connector.setPathParams(initialParams);
	}
});

/**
 * A base glyph of arc segment.
 * @class
 * @augments Kekule.Glyph.PathGlyph
 */
Kekule.Glyph.BaseArc = Class.create(Kekule.Glyph.PathGlyph,
/** @lends Kekule.Glyph.BaseArc# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Glyph.BaseArc',
	/** @constructs */
	initialize: function($super, id, refLength, initialParams, coord2D, coord3D)
	{
		$super(id, refLength, initialParams, coord2D, coord3D);
	},
	/** @ignore */
	doCreateDefaultStructure: function(refLength, initialParams)
	{
		// initialParams can include additional field: lineLength
		var C = Kekule.CoordUtils;

		var coord2D = {'x': 0, 'y': 0};
		var coord3D = {'x': 0, 'y': 0, 'z': 0};
		var delta = {'x': refLength * (initialParams.lineLength || 1)};
		//var controllerDelta = {'x': 0, 'y': delta.x / 2};

		var node1 = new Kekule.Glyph.PathGlyphNode(null, null, coord2D, coord3D);  // starting node
		var node2 = new Kekule.Glyph.PathGlyphNode(null, null, C.add(coord2D, delta), C.add(coord3D, delta));  // ending node
		this.appendNode(node1);
		this.appendNode(node2);

		//var node3 = new Kekule.Glyph.PathGlyphNode(null, Kekule.Glyph.NodeType.CONTROLLER, C.add(coord2D, controllerDelta), C.add(coord3D, controllerDelta));  // control node
		var connector = new Kekule.Glyph.PathGlyphArcConnector(null, [node1, node2]);
		this._applyParamsToConnector(connector, initialParams);

		/*
		var controlPoint = connector.getControlPoint();
		//controlPoint.setDistanceToChord(delta.x)
		controlPoint.setCoord2D(controllerDelta)
				.setCoord3D(controllerDelta);
		*/

		this.appendConnector(connector);

		connector.setInteractMode(Kekule.ChemObjInteractMode.HIDDEN);
		//node1.setInteractMode(Kekule.ChemObjInteractMode.HIDDEN);
		//node2.setInteractMode(Kekule.ChemObjInteractMode.HIDDEN);
	},
	/** @private */
	_isValidChemNodeOrConnectorStickTarget: function(targetObj)
	{
		var result = (targetObj instanceof Kekule.ChemStructureNode) || (targetObj instanceof Kekule.ChemStructureConnector);
		if (!result && (targetObj instanceof Kekule.ChemMarker.BaseMarker))
		{
			var parent = targetObj.getParent && targetObj.getParent();
			if (parent)  // the marker of node/connector (e.g., electron pair) can also be a valid target
				result = (parent instanceof Kekule.ChemStructureNode) || (parent instanceof Kekule.ChemStructureConnector);
		}
		return result;
	},
	/** @private */
	_applyParamsToConnector: function(connector, initialParams)
	{
		connector.setPathParams(initialParams);
	},
	/** @ignore */
	getAllowChildCoordStickTo: function(child, dest)
	{
		var result = !dest  // dest not set, a general test, just returns true
			|| (this._isValidChemNodeOrConnectorStickTarget(dest, child) && !this._isChildrenStickingTo(dest, [child]));
			/*
			|| ((dest instanceof Kekule.ChemStructureNode) || (dest instanceof Kekule.ChemStructureConnector)) && (!this._isChildrenStickingTo(dest, [child]))
			|| (dest instanceof Kekule.ChemMarker.BaseMarker);
			*/
		//console.log('allow stick to', dest && dest.getClassName(), result);
		return result;
	},
	/** @ignore */
	getChildUseCoordStickOffset: function($super, child, stickDest)
	{
		if (stickDest instanceof Kekule.ChemStructureNode || stickDest instanceof Kekule.ChemStructureConnector)
		{
			return true;
		}
		else
		{
			return false;
			//return $super(child, stickDest);
		}
	},
	/** @private */
	_isChildrenStickingTo: function(dest, excludeChildren)
	{
		var nodes = this.getNodes();
		nodes = Kekule.ArrayUtils.exclude(nodes, excludeChildren || []);
		for (var i = 0, l = nodes.length; i < l; ++i)
		{
			var n = nodes[i];
			if (n.getCoordStickTarget() === dest)
				return true;
		}
		return false;
	}
});

/**
 * A base glyph of double arc glyph (for bond forming electron pushing arrow).
 * @class
 * @augments Kekule.Glyph.PathGlyph
 */
Kekule.Glyph.BaseTwinArc = Class.create(Kekule.Glyph.PathGlyph,
	/** @lends Kekule.Glyph.BaseTwinArc# */
	{
		/** @private */
		CLASS_NAME: 'Kekule.Glyph.BaseTwinArc',
		/**
		 * @constructs
		 */
		initialize: function($super, id, refLength, initialParams, coord2D, coord3D)
		{
			/*
			this._insideNodeGetIndirectCoordRefLengthsBind = this._insideNodeGetIndirectCoordRefLengths.bind(this);
			this._insideNodeGetIndirectCoordRefCoordsBind = this._insideNodeGetIndirectCoordRefCoords.bind(this);
			this._insideNodeCalcIndirectCoordStorageBind = this._insideNodeCalcIndirectCoordStorage.bind(this);
			this._insideNodeCalcIndirectCoordValueBind = this._insideNodeCalcIndirectCoordValue.bind(this);
			*/
			$super(id, id, refLength, initialParams, coord2D, coord3D);
		},
		/** @ignore */
		doCreateDefaultStructure: function(refLength, initialParams)
		{
			// initialParams can include additional field: lineLength
			var C = Kekule.CoordUtils;
	
			var coord2D = {'x': 0, 'y': 0};
			var coord3D = {'x': 0, 'y': 0, 'z': 0};
			var lineLength = initialParams.lineLength || 1;
			var lineGap = (initialParams.lineGap || lineLength / 5);
			var deltaLine = {'x': refLength * ((lineLength - lineGap) / 2)};
			var deltaGap = {'x': refLength * lineGap};
			var deltaTotal = {'x': lineLength};
	
			var node1 = new Kekule.Glyph.PathGlyphNode(null, null, coord2D, coord3D);  // starting node of first arc
			var node2 = new Kekule.Glyph.PathGlyphNode(null, null);  // ending node of first arc
			node2.setEnableIndirectCoord(true)
				.overwriteMethod('getIndirectCoordRefLengths', this._insideNodeGetIndirectCoordRefLengths)
				.overwriteMethod('getIndirectCoordRefCoords', this._insideNodeGetIndirectCoordRefCoords)
				.overwriteMethod('calcIndirectCoordStorage', this._insideNodeCalcIndirectCoordStorage)
				.overwriteMethod('calcIndirectCoordValue', this._insideNodeCalcIndirectCoordValue);
			var node3 = new Kekule.Glyph.PathGlyphNode(null, null);  // starting node of second arc
			//node3.setEnableIndirectCoord(true);
			var node4 = new Kekule.Glyph.PathGlyphNode(null, null, C.add(coord2D, deltaTotal), C.add(coord3D, deltaTotal));  // ending node of second arc
			this.appendNode(node1);
			this.appendNode(node2);
			this.appendNode(node3);
			this.appendNode(node4);
	
			node2.setCoord2D(C.add(coord2D, deltaLine)).setCoord3D(C.add(coord3D, deltaLine));
			node3.setCoord2D(C.add(coord2D, CU.add(deltaLine, deltaGap))).setCoord3D(C.add(coord3D, CU.add(deltaLine, deltaGap)));
	
			var connector1 = new Kekule.Glyph.PathGlyphArcConnector(null, [node1, node2]);
			var connector2 = new Kekule.Glyph.PathGlyphArcConnector(null, [node4, node3]);
			this._applyParamsToConnector(connector1, initialParams);
			this._applyParamsToConnector(connector2, initialParams);
	
			this.appendConnector(connector1);
			this.appendConnector(connector2);
	
			connector1.setInteractMode(Kekule.ChemObjInteractMode.HIDDEN);
			connector2.setInteractMode(Kekule.ChemObjInteractMode.HIDDEN);
		},
		/** @private */
		_applyParamsToConnector: function(connector, initialParams)
		{
			connector.setPathParams(initialParams);
		},
	
		// overwrite methods of two inside nodes of arcs, so this these methods, this var refers to the node but not the glyph
		/** @private */
		_insideNodeGetIndirectCoordRefLengths: function($old, coordMode, allowCoordBorrow)
		{
			var glyph = this.getParent();
			if (glyph && coordMode === Kekule.CoordMode.COORD2D)
			{
				var nodeStart = glyph.getNodeAt(0);
				var nodeEnd = glyph.getNodeAt(glyph.getNodeCount() - 1);
				if (nodeStart && nodeEnd)
				{
					var coord1 = nodeStart.getAbsCoordOfMode(coordMode);
					var coord2 = nodeEnd.getAbsCoordOfMode(coordMode);
					var d = Kekule.CoordUtils.getDistance(coord2, coord1);
					var result = {'x': d, 'y': d, 'length': d};
					//console.log('_insideNodeGetIndirectCoordRefLengths', result);
					return result;
				}
			}
			else
				return $old(coordMode, allowCoordBorrow);
		},
		/** @private */
		_insideNodeGetIndirectCoordRefCoords: function($old, coordMode, allowCoordBorrow)
		{
			var glyph = this.getParent();
			if (glyph && coordMode === CM.COORD2D)
			{
				var nodeStart = glyph.getNodeAt(0);
				var nodeEnd = glyph.getNodeAt(glyph.getNodeCount() - 1);
				if (nodeStart && nodeEnd)
				{
					/*
					var coord1 = nodeStart.getAbsCoordOfMode(coordMode);
					var coord2 = nodeEnd.getAbsCoordOfMode(coordMode);
					*/
					var coord1 = nodeStart.getCoordOfMode(coordMode);
					var coord2 = nodeEnd.getCoordOfMode(coordMode);
					//console.log('_insideNodeGetIndirectCoordRefCoords', coord);
					return [coord1, coord2];
				}
			}
			else
				return $old(coordMode, allowCoordBorrow);
		},
		/** @private */
		_insideNodeCalcIndirectCoordStorage: function($old, coordMode, coordValue, oldCoordValue, allowCoordBorrow)
		{
			var glyph = this.getParent();
			if (glyph && coordMode === CM.COORD2D)
			{
				//var refLength = this._insideNodeGetIndirectCoordRefLengths(null, coordMode, allowCoordBorrow).length;
				var refCoords = this.getIndirectCoordRefCoords(coordMode, allowCoordBorrow);
				//var refLength = CU.getDistance(refCoords[1], refCoords[0]);
				if (refCoords)
				{
					var nodeStart = glyph.getNodeAt(0);
					var baseCoord = nodeStart.getCoordOfMode(coordMode);
	
					var crossPoint = Kekule.GeometryUtils.getPerpendicularCrossPointFromCoordToLine(coordValue, refCoords[0], refCoords[1], false);
					if (!crossPoint)  // outside ref line
					{
						var d0 =CU.getDistance(coordValue, refCoords[0]);
						var d1 =CU.getDistance(coordValue, refCoords[1]);
						if (d0 < d1)
							crossPoint = refCoords[0];
						else
							crossPoint = refCoords[1];
					}
					var crossPointDistance = CU.getDistance(baseCoord, crossPoint);
					var refDistance = CU.getDistance(refCoords[1], refCoords[0]);
	
					var ratio = refDistance? crossPointDistance / refDistance: 0;
	
					if (ratio < 0)
					{
						ratio = 0;
					}
					else if (ratio > 1)
					{
						ratio = 1;
					}
	
					return {'x': ratio, 'y': ratio, 'ratio': ratio};
				}
			}
	
			return $old(coordMode, coordValue, oldCoordValue, allowCoordBorrow);
		},
		/** @private */
		_insideNodeCalcIndirectCoordValue: function($old, coordMode, allowCoordBorrow)
		{
			var glyph = this.getParent();
			if (glyph && coordMode === CM.COORD2D)
			{
				var refCoords = this.getIndirectCoordRefCoords(coordMode, allowCoordBorrow);
				if (refCoords)
				{
					var refDelta = CU.substract(refCoords[1], refCoords[0]);
					var nodeStart = glyph.getNodeAt(0);
					var baseCoord = nodeStart.getCoordOfMode(coordMode);
					var ratio = this.getIndirectCoordStorageOfMode(coordMode)['ratio'];
					if (Kekule.ObjUtils.notUnset(ratio))
					{
						var delta = CU.multiply(refDelta, ratio);
						var result = CU.add(baseCoord, delta);
						//console.log('calc', this.getIndirectCoordStorageOfMode(coordMode), ratio, delta, result);
						return result;
					}
				}
			}
	
			return $old(coordMode, allowCoordBorrow);
		},
	
	
		/** @private */
		_isValidChemNodeOrConnectorStickTarget: function(targetObj)
		{
			var result = (targetObj instanceof Kekule.ChemStructureNode) || (targetObj instanceof Kekule.ChemStructureConnector);
			if (!result && (targetObj instanceof Kekule.ChemMarker.BaseMarker))
			{
				var parent = targetObj.getParent && targetObj.getParent();
				if (parent)  // the marker of node/connector (e.g., electron pair) can also be a valid target
					result = (parent instanceof Kekule.ChemStructureNode) || (parent instanceof Kekule.ChemStructureConnector);
			}
			return result;
		},
		/** @ignore */
		getAllowChildCoordStickTo: function(child, dest)
		{
			var index = this.indexOfNode(child);
			if (index === 0 || index === this.getNodeCount() - 1)  // only the leading and tailing node can be sticked
			{
				var result = !dest  // dest not set, a general test, just returns true
					|| (this._isValidChemNodeOrConnectorStickTarget(dest, child) && !this._isChildrenStickingTo(dest, [child]));
				return result;
			}
			else
				return false;
		},
		/** @ignore */
		getChildUseCoordStickOffset: function($super, child, stickDest)
		{
			if (stickDest instanceof Kekule.ChemStructureNode || stickDest instanceof Kekule.ChemStructureConnector)
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		/** @private */
		_isChildrenStickingTo: function(dest, excludeChildren)
		{
			var nodes = this.getNodes();
			nodes = Kekule.ArrayUtils.exclude(nodes, excludeChildren || []);
			for (var i = 0, l = nodes.length; i < l; ++i)
			{
				var n = nodes[i];
				if (n.getCoordStickTarget() === dest)
					return true;
			}
			return false;
		}
	});
	
return Kekule;
};
