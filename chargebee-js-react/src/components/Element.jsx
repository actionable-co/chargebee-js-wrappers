import React from 'react';
import { isEqual, genUUID } from '../utils/';

export default class Element extends React.Component {
    constructor(props) {
        super(props);
        this.field = null
        this.id = `card-${props.type}-${genUUID()}`;
        this.ElementRef = React.createRef();
    }

    componentDidMount() {
        const { cbComponent, type, listeners } = this.props;
        const options = this.getPropOptions(this.props);
        this.field = cbComponent.createField(type, options).at(`#${this.id}`);
        
        // Attaching listeners if any
        if(listeners) {
            if(listeners.onBlur) this.field.on('blur', listeners.onBlur);
            if(listeners.onFocus) this.field.on('focus', listeners.onFocus);
            if(listeners.onReady) this.field.on('ready', listeners.onReady);
            if(listeners.onChange) this.field.on('change', listeners.onChange);
        }
    }

    getPropOptions(props) {
        const { icon, styles: style, placeholder } = props;
        return {
            icon,
            style,
            placeholder,
        }
    }

    componentDidUpdate(prevProps) {
        const prevOptions = this.getPropOptions(prevProps)
        const currentOptions = this.getPropOptions(this.props)

        if(!isEqual(prevOptions, currentOptions) && this.field) {
            this.field.update(currentOptions)
        }
    }

    /**
     * Commenting to prevent cross origin errors
     * which occurs when the field component is flushed from DOM
     * much before the destroy API gets invoked.
     */
    // componentWillUnmount() {
    //     this.field.destroy();
    // }

    focus() {
        this.field.focus();
    }

    blur() {
        this.field.blur();
    }

    clear() {
        this.field.clear();
    }

    render() {
        const {className} = this.props;
        return (
            <div id={this.id} ref={this.ElementRef} className={className}>
                {this.props.children}
            </div>
        )
    }
}
