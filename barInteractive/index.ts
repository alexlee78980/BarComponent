// @ts-nocheck
import { IInputs, IOutputs } from "./generated/ManifestTypes";
//import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;
import * as d3 from "d3";
interface barData {
	label: string;
	value: number;
	determine: string;
}
export class barInteractive implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	/**
	 * Empty constructor.
	 */
	private _value: string;
	private _container: string;
	private _notifyOutputChanged: () => void;
	private key: string;
	private value: number;
	private x_text: string = "";
	private y_text: string = "";
	private width: number = 500;
	private height: number = 500;
    private determ: string = "";
    private notifyOutput: boolean = false;
	constructor() {}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(
		context: ComponentFramework.Context<IInputs>,
		notifyOutputChanged: () => void,
		state: ComponentFramework.Dictionary,
		container: HTMLDivElement
	): void {
		this._container = container
		;
		context.mode.trackContainerResize(true);
		this._notifyOutputChanged = notifyOutputChanged;
		context.mode.allocatedHeight = 500;
		context.mode.allocatedWidth = 500;
		// if(this.IsJsonString(dataSet)) {
		// 	this.drawChart(this._container, JSON.parse(dataSet));
		// }else
		// {
		this.drawChart(this._container, []);
	}

	public drawChart(component: string, data: Array<barData>) {
		const margin = { top: 30, right: 150, bottom: 70, left: 60 },
			width = this.width - margin.left - margin.right,
			height = this.height - margin.top - margin.bottom;
		var sumstat = d3.group(data, (d) => d.determine);
		console.log(sumstat);
        console.log(sumstat.length)
        console.log(sumstat.size)
		d3.select(component).select("svg").remove();
		// append the svg object to the body of the page
		const svg = d3
			.select(component)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);
		let shiftbox = 0;
		let shifttext = 0;
        let array = Array.from(sumstat, ([determine, value]) => ({ determine, value}));
		if (array.length > 0 && !this.determ) {
			this.determ = array[0].determine;
		}
        console.log(array);
        svg
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text(this.x_text);

    svg
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(this.y_text);
		for (let i: number = 0; i < array.length; i++) {
            svg
            .append("rect")
            .attr("x", width + 10)
            .text("test")
            .attr("y", function () {
                shiftbox += 1;
                return height - shiftbox * 40;
            })
            .attr("width", 100)
            .attr("height", 40)
            .attr("stroke", "black")
            .attr("fill", "#69a3b2").on("click", (d, k) => {
				this.determ = array[i].determine;
                update(data, this.determ);
				
			});
				svg
					.append("text")
					.attr("x", width + 15)
					.text("test")
					.attr("y", function () {
						shifttext += 1;
						return height + 20 - shifttext * 40;
					})
					.text(array[i].determine).on("click", (d, k) => {
				this.determ = array[i].determine;
                update(data, this.determ);
				
			});
			}
		// Initialize the X axis
		const x = d3.scaleBand().range([0, width]).padding(0.2);
		const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

		// Initialize the Y axis
		const y = d3.scaleLinear().range([height, 0]);
		const yAxis = svg.append("g").attr("class", "myYaxis");
        
		// A function that create / update the plot for a given variable:
		const update = (datas, det)=> {

            let data = datas.filter(function(v){
                console.log( v);
                return det  == v.determine })
			console.log("data filt " + data);
			// Update the X axis
			x.domain(data.map((d) => d.label));
			xAxis.call(d3.axisBottom(x));

			// Update the Y axis
			y.domain([0, d3.max(data, (d) => d.value)]);
			yAxis.transition().duration(1000).call(d3.axisLeft(y));
            d3.select("svg").selectAll("rect").remove();
			// Create the u variable


			svg
			.selectAll("mybar")
			.data(data)
			.join("rect")
			.attr("x", (d) => x(d.label))
			.attr("y", (d) => y(d.value))
			.attr("width", x.bandwidth())
			.attr("height", (d) => height - y(d.value))
			.attr("fill", "#69b3a2")
			.on("click", (d, i) => {
				console.log(d);
				console.log(i);
				this.key = i.label;
				this.value = i.value;
                this.notifyOutput = true;
				this._notifyOutputChanged();
			});

		}
		console.log(data);
		// Initialize the plot with the first dataset
		update(data, this.determ);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		let keys: string[] = Object.keys(context.parameters.Bar_Data.records);
		let firstColumnName: string = context.parameters.Bar_Data.columns[0].name; //get the name of the first column
		let secondColumnName: string = context.parameters.Bar_Data.columns[1].name; //get the name of the second column
        let thirdColumnName: string = context.parameters.Bar_Data.columns[2].name;
		let csvDataset: barData[] = [];
		if (secondColumnName != "telephone1") {
			this.y_text = firstColumnName;
			this.x_text = secondColumnName;
		}
		console.log("ranUpdate");
		console.log(context.mode.allocatedWidth);
		this.width = context.mode.allocatedWidth;
		this.height = context.mode.allocatedHeight;
		console.log(context.parameters.x_label.raw);
		console.log(context.parameters.y_label.raw);
		this.x_text = context.parameters.x_label.raw;
		this.y_text = context.parameters.y_label.raw;

		//iterate over the items in the keys array and get the value of the first and second columns
		for (let i: number = 0; i < keys.length; i++) {
			let key = keys[i];
			let label: string = context.parameters.Bar_Data.records[key].getFormattedValue(firstColumnName);
			let value: number = Number(context.parameters.Bar_Data.records[key].getValue(secondColumnName));
            let determine: string = context.parameters.Bar_Data.records[key].getFormattedValue(thirdColumnName);
			csvDataset.push({ label, value, determine });
		}
		var helper = {};
		var result = csvDataset.reduce(function (r, o) {
			var key = o.determine + '-' + o.label;

			if (!helper[key]) {
				helper[key] = Object.assign({}, o); // create a copy of o
				r.push(helper[key]);
			} else {
				helper[key].value += o.value;
			}

			return r;
		}, []);
        console.log(this.notifyOutput);
        if(!this.notifyOutput){
		this.drawChart(this._container, result);
        }
        this.notifyOutput = false;
	}
	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			key: this.key,
			value: this.value,
		} as IOutputs;
	}
	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}
}
