var React = require('react');
var Befunge = require('./befunge');
var _ = require('lodash');

var d = React.DOM;

var Main = React.createClass({
    update: function(programState) {
        this.state.prevStates.push(this.state.b.state);
        this.state.b.state = programState;
        this.setState({
            b: this.state.b,
            prevStates: this.state.prevStates
        });
    },
    input: function() {
        this.setState({
            wantsInput: true
        });
    },
    output: function(s) { },
    reset: function(programString) {
        this.setState({
            b: this.state.b.reset(programString),
            prevStates: []
        });
        if (_.isString(programString)) {
            window.localStorage.setItem('storedProgram', programString);
        }
    },
    run: function() {
        this.state.b.run();
    },
    stepBack: function() {
        if (this.state.prevStates.length) {
            this.state.b.state = this.state.prevStates.pop();
            this.setState({
                b: this.state.b,
                prevStates: this.state.prevStates
            });
        }
    },
    setDelay: function(delay) {
        this.state.b.setDelay(delay);
        this.setState({
            b: this.state.b
        });
    },
    getInitialState: function() {
        return {
            b: null,
            prevStates: []
        };
    },
    componentWillMount: function() {
        var initialProgram = window.localStorage.getItem('storedProgram') || '0"!dlrow olleH">:#,_@';
        var b = Befunge(initialProgram, {
            input: this.input,
            output: this.output,
            callback: this.update
        });
        this.setState({
            b: b,
            programState: b.state
        });
    },
    render: function() {
        return d.div(
            null,
            d.div(
                null,
                d.div(
                    { className: 'left' },
                    Editor({
                        program: this.state.b.state.get('program'),
                        reset: this.reset
                    }),
                    Program({
                        program: this.state.b.state.get('program'),
                        x: this.state.b.state.get('x'),
                        y: this.state.b.state.get('y')
                    })
                ),
                d.div(
                    { className: 'right' },
                    Controls({
                        b: this.state.b,
                        run: this.run,
                        stepBack: this.stepBack,
                        reset: this.reset,
                        setDelay: this.setDelay
                    }),
                    Stats({
                        programState: this.state.b.state
                    }),
                    Output({
                        outputString: this.state.b.state.get('outputString')
                    })
                )
            )
        );
    }
});

var Controls = React.createClass({
    setDelay: function(e) {
        this.props.setDelay(parseInt(e.target.value));
    },
    render: function() {
        return d.div(
            null,
            d.input({
                type: 'button',
                value: 'Run',
                onClick: this.props.run
            }),
            d.input({
                type: 'button',
                value: 'Pause',
                onClick: this.props.b.pause
            }),
            d.input({
                type: 'button',
                value: 'Reset',
                onClick: this.props.reset
            }),
            d.input({
                type: 'button',
                value: 'Step +',
                onClick: this.props.b.step
            }),
            d.input({
                type: 'button',
                value: 'Step -',
                onClick: this.props.stepBack
            }),
            d.label(
                null,
                ' Delay: ',
                d.select(
                    { onChange: this.setDelay },
                    d.option({ value: 0 }, '0'),
                    d.option({ value: 100 }, '100 ms'),
                    d.option({ value: 200 }, '200 ms'),
                    d.option({ value: 500 }, '500 ms'),
                    d.option({ value: 1000 }, '1 s')
                )
            )
        );
    }
});

var Stats = React.createClass({
    render: function() {
        var s = this.props.programState;
        return d.div(
            { className: 'info' },
            d.div(
                null,
                'x: ', s.get('x'),', y: ', s.get('y'),', tick: ', s.get('tick'),', width: ', s.get('width'),', height: ', s.get('height')
            )
        );
    }
});

var Output = React.createClass({
    render: function() {
        return d.div(
            { className: 'output' },
            d.h3(null, 'Output:'),
            this.props.outputString
        );
    }
});

var Program = React.createClass({
    render: function() {
        var self = this;
        return d.div(
            { className: 'program' },
            this.props.program.toArray().map(function(line, y) {
                return d.div(
                    {
                        className: 'program-line',
                        key: 'line-' + y
                    },
                    line.toArray().map(function(cell, x) {
                        var current = (self.props.x == x && self.props.y == y);
                        return d.span(
                            {
                                className: (current ? 'current' : ''),
                                key: 'cell-' + x
                            },
                            // Replace spaces with non-breaking spaces
                            (cell == ' ' ? '\u00a0' : cell)
                        );
                    })
                );
            })
        );
    }
});


var Editor = React.createClass({
    updateProgram: function(e) {
        this.props.reset(e.target.value);
    },
    render: function() {
        var programString = this.props.program.map(function(line) {
            return line.toArray().join('');
        }).toArray().join('\n');
        return d.div(
            null,
            d.textarea({
                value: programString,
                ref: 'program',
                onChange: this.updateProgram
            })
        );
    }
});


React.renderComponent(Main(), document.getElementById('main'));
