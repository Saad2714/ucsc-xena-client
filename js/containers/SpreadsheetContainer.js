'use strict';

var React = require('react');
var _ = require('../underscore_ext');
var getLabel = require('../getLabel');
var {supportsEdit} = require('../models/fieldSpec');
var {addCommas} = require('../util');

function fixSampleTitle(column, i, samples, wizardMode, cohort) {
	return i === 0 ? _.updateIn(column,
		['user', 'fieldLabel'], label => wizardMode ?
			`${addCommas(samples.length)} samples` : label,
		['user', 'columnLabel'], label => wizardMode ? cohort.name : label) :
	column;
}

function columnSelector(id, i, appState) {
	var {data, zoom, columns, samples, samplesMatched, wizardMode, cohort} = appState;
	return {
		id: id,
		key: id,
		samples: samples,
		samplesMatched: samplesMatched,
		zoom: zoom,
		index: _.getIn(appState, ['index', id]),
		vizSettings: _.getIn(appState, ['columns', id, 'vizSettings']),
		data: _.getIn(data, [id]) /* refGene */,
		column: fixSampleTitle(_.getIn(columns, [id]), i, samples, wizardMode, cohort),
		label: getLabel(i) // <<- put in Spreadsheet? We don't really need it here.
	};
}

function isInteractive(props, state) {
	var {interactive} = state,
		{appState: {wizardMode, editing}} = props;
	return !wizardMode && editing == null && _.every(interactive);
}

var getSpreadsheetContainer = (Column, Spreadsheet) => class extends React.Component {
	static displayName = 'SpreadsheetContainer';

	state = {
	    interactive: {}
	};

	onInteractive = (key, interactive) => {
		this.setState({interactive:
			_.assoc(this.state.interactive, key, interactive)});
	};

	onResize = (id, size) => {
		this.props.callback(['resize', id, size]);
	};

	onXZoom = (id, xzoom) => {
		this.props.callback(['xzoom', id, xzoom]);
	};

	onYZoom = (yzoom) => {
		this.props.callback(['enableTransition'], false);
		this.props.callback(['zoom', yzoom]);
	};

	onRemove = (id) => {
		this.props.callback(['remove', id]);
	};

	onKm = (id) => {
		this.props.callback(['km-open', id]);
	};

	onSortDirection = (id, newDir) => {
		this.props.callback(['sortDirection', id, newDir]);
	};

	onMode = (id, newMode) => {
		this.props.callback(['fieldType', id, newMode]);
	};

	onColumnLabel = (id, value) => {
		this.props.callback(['columnLabel', id, value]);
	};

	onFieldLabel = (id, value) => {
		this.props.callback(['fieldLabel', id, value]);
	};

	onShowIntrons = (id) => {
		this.props.callback(['showIntrons', id]);
	};

	onCluster = (id, value) => {
		this.props.callback(['cluster', id, value]);
	};

	onSortVisible = (id, value) => {
		this.props.callback(['sortVisible', id, value]);
	};

	onOpenVizSettings = (id) => {
		this.props.callback(['vizSettings-open', id]);
	};

	onVizSettings = (id, state) => {
		this.props.callback(['vizSettings', id, state]);
	};

	onEdit = (id) => {
		this.props.callback(['edit-column', id]);
	};

	onAddColumn = (pos) => {
		this.props.callback(['edit-column', pos]);
	};

	onReload = (id) => {
		this.props.callback(['reload', id]);
	};

	onReset = () => {
		this.props.callback(['cohortReset']);
	};

	onAbout = (host, dataset) => {
        this.props.callback(['navigate', 'datapages', {host, dataset}]);
	};

	render() {
		var columnProps = _.pick(this.props,
				['searching', 'fieldFormat', 'sampleFormat', 'samplesMatched']),
			{appState, wizard: {cohortTumorMap}} = this.props,
			{columnOrder, wizardMode, hasSurvival} = appState,
			interactive = isInteractive(this.props, this.state);

		// XXX prune callback from this.props
		// Currently it's required for ColumnEdit2 and zoom helper.
		return (
			<Spreadsheet
					onAddColumn={this.onAddColumn}
					onOpenVizSettings={this.onOpenVizSettings}
					onVizSettings={this.onVizSettings}
					interactive={interactive}
					onInteractive={this.onInteractive}
					{...this.props}>

				{_.map(columnOrder, (id, i) => (
					<Column
						interactive={interactive}
						hasSurvival={hasSurvival}
						cohort={appState.cohort}
						onAbout={this.onAbout}
						onViz={this.onOpenVizSettings}
						onEdit={supportsEdit(_.get(appState.columns, id)) &&
							interactive ? this.onEdit : null}
						onFieldLabel={this.onFieldLabel}
						onColumnLabel={this.onColumnLabel}
						onReset={this.onReset}
						onShowIntrons={this.onShowIntrons}
						onCluster={this.onCluster}
						onSortVisible={this.onSortVisible}
						onMode={this.onMode}
						onInteractive={this.onInteractive}
						onKm={this.onKm}
						onSortDirection={this.onSortDirection}
						onXZoom={this.onXZoom}
						onYZoom={this.onYZoom}
						onRemove={this.onRemove}
						onResize={this.onResize}
						onReload={this.onReload}
						actionKey={id}
						first={i === 0}
						{...columnProps}
						{...columnSelector(id, i, appState)}
						wizardMode={wizardMode}
						editing={appState.editing}
						tumorMap={cohortTumorMap}/>))}
			</Spreadsheet>);
	}
};

module.exports = {getSpreadsheetContainer};
