/** @format */
/* eslint spaced-comment:0 */
/// <reference types="./apps/portal/typings/global" />

import * as enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });

global.__SERVER__ = true;
