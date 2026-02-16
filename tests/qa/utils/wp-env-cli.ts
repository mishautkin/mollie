/**
 * Internal dependencies
 */
import { WpCli } from './wp-cli';

/**
 * Class for executing WP CLI commands on wp-env
 */
export class WpEnvCli extends WpCli {
	protected commandPrefix = 'npx wp-env run cli bash -c "';
	protected commandPostfix = '"';
	constructor( protected readonly path: string ) {
		super();

		if ( ! path ) {
			throw new Error( 'WpEnvCli: path is required' );
		}

		this.execOptions = { cwd: path };
	}
}
