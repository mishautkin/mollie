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
import { WpCliConfig } from './types';

type BaseExtend = {
	cli: WpEnvCli;
};

const test = base.extend< BaseExtend >( {
	cli: async ( {}, use ) => {
		await use( new WpEnvCli(
			String( process.env.WPCLI_PATH )
		) );
	},
} );

export { test, expect, BaseExtend };
