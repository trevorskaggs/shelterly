import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars-2';
import css from 'dom-css';

class ShadowScrollbars extends Component {

  constructor(props, ...rest) {
    super(props, ...rest);
    this.state = {
        scrollTop: 0,
        scrollLeft: 0,
        scrollHeight: 0,
        scrollWidth: 0,
        clientHeight: 0,
        clientWidth: 0,
    };
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate(values) {
    const { shadowTop, shadowBottom, shadowRight, shadowLeft } = this.refs;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = values;

    if (this.props.no_shadow !== "true") {
      const shadowTopOpacity = 1 / 20 * Math.min(scrollTop, 20);
      const bottomScrollTop = scrollHeight - clientHeight;
      const shadowBottomOpacity = 1 / 20 * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20));
      css(shadowTop, { opacity: shadowTopOpacity });
      css(shadowBottom, { opacity: shadowBottomOpacity });
    }

    if (this.props.horizontal) {
      const shadowLeftOpacity = 1 / 20 * Math.min(scrollLeft, 20);
      const rightScrollLeft = scrollWidth - clientWidth;
      const shadowRightOpacity = 1 / 20 * (rightScrollLeft - Math.max(scrollLeft, rightScrollLeft - 20));
      css(shadowRight, { opacity: shadowRightOpacity });
      css(shadowLeft, { opacity: shadowLeftOpacity });
    }
  }

  render() {
    const { style, ...props } = this.props;
    const containerStyle = {
        ...style,
        position: 'relative'
    };
    const shadowTopStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        background: 'linear-gradient(to bottom, rgba(226, 226, 226, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
    };
    const shadowBottomStyle = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 10,
        background: 'linear-gradient(to top, rgba(226, 226, 226, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
    };
    const shadowLeftStyle = {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      width: 10,
      background: 'linear-gradient(to right, rgba(226, 226, 226, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
    };
    const shadowRightStyle = {
      position: 'absolute',
      bottom: 0,
      left: 1018,
      right: 0,
      height: 100,
      width: 10,
      background: 'linear-gradient(to left, rgba(226, 226, 226, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
    };
    
    return (
      <div style={containerStyle}>
        <Scrollbars
          ref="scrollbars"
          onUpdate={this.handleUpdate}
          renderThumbVertical={props => <div {...props} style={{...props.style, background: 'rgba(226, 226, 226, 0.6)'}} />}
          renderThumbHorizontal={props => <div {...props} style={{...props.style, background: 'rgba(226, 226, 226, 0.6)'}} />}
          {...props}/>
        {props.no_shadow !== "true" ?
        <div
          ref="shadowTop"
          style={shadowTopStyle}/> : ""}
        {props.no_shadow !== "true" ?
        <div
          ref="shadowBottom"
          style={shadowBottomStyle}/> : ""}
        {props.horizontal ?
        <div
          ref="shadowRight"
          style={shadowRightStyle}/> : ""}
        {props.horizontal ?
        <div
          ref="shadowLeft"
          style={shadowLeftStyle}/> : ""}
      </div>
    );
  }
}

ShadowScrollbars.propTypes = {
  style: PropTypes.object
};

export default ShadowScrollbars;
