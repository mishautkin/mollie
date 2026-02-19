/**
 * External dependencies
 */
import {
	testPluginInstallationFromFile,
	testPluginReinstallationFromFile,
	testPluginDeactivation,
	testPluginRemoval,
} from '@inpsyde/playwright-utils/build';
/**
 * Internal dependencies
 */
import { test, expect } from '../../utils';
import { molliePlugin } from '../../resources';

testPluginInstallationFromFile( 'C419986', molliePlugin, '@Critical' );

testPluginReinstallationFromFile( 'C3322', molliePlugin );

testPluginDeactivation( 'C3319', molliePlugin );

testPluginRemoval( 'C3318', molliePlugin );

test( 'Test CLI @Critical', async ( { visitorPage, cli } ) => {
	await cli.setWpConst( { WP_DEBUG: true } );
	const now = Date.now();
	const postTitle = `Test post ${ now }`;
	const postId = await cli.postCreate( {
		post_type: 'post',
		post_title: postTitle,
		post_status: 'publish',
	} );
	console.log( 'Post ID:', JSON.stringify( postId ) );
	
	await visitorPage.goto( `/` );
	await expect.soft(
		visitorPage.getByText( postTitle ).first(),
		'Assert post title',
	).toBeVisible();

	// Not working:
	await visitorPage.goto( `/test-post-${ now }/` );
	await expect.soft(
		visitorPage.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );

	await visitorPage.goto( `/?page_id=${ postId }` );
	await expect.soft(
		visitorPage.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );
} );