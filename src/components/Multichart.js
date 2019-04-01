import React, {Component} from 'react';
import {Bar} from 'react-chartjs-2';

class MultiChart extends Component {


    static defaultProps = {
        labels: [],
        results: [],
        bcgColors: [],

    }

    constructor(props) {
        super(props);
        this.state = {
            chartData: {
                labels: this.props.labels,
                datasets: [{
                    label: 'Votes',
                    data: this.props.results,
                    backgroundColor:this.props.bcgColors
                }]
            }
        }
    }

    test() {
        console.log(this.props.labels);
        console.log(this.props.results);
        console.log(this.props.bcgColors);
    }


    componentDidMount(){
        this.test();
    }

    render() {
        return(
            <div className="chart">
            <Bar 
                data = {this.state.chartData}
                options = {{
                    title: {
                        display:true,
                        text: 'Poll Voting Data'
                    },
                    legend: {
                        display: false
                    }
                }}
            />
            </div>
        )
    }
}

export default MultiChart;