/**
 * External dependencies
 */
import { test as base, expect } from '@playwright/test';
/**
 * Internal dependencies
 */
import {
	WpEnvCli,
} from './wp-env-cli';

type TestExtend = {
	cli: WpEnvCli;
};

const test = base.extend< TestExtend >( {
	cli: async ( {}, use ) => {
		await use( new WpEnvCli(
			String( process.env.WPCLI_PATH )
		) );
	},
} );

export { test, expect, TestExtend };
