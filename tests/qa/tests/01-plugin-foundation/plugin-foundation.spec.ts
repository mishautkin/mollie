/**
 * External dependencies
 */
import {
	testPluginInstallationFromFile,
	testPluginReinstallationFromFile,
	testPluginDeactivation,
	testPluginRemoval,
	test,
	expect,
} from '@inpsyde/playwright-utils/build';
/**
 * Internal dependencies
 */
import { molliePlugin } from '../../resources';

testPluginInstallationFromFile( 'C419986', molliePlugin, '@Critical' );

testPluginReinstallationFromFile( 'C3322', molliePlugin );

testPluginDeactivation( 'C3319', molliePlugin );

testPluginRemoval( 'C3318', molliePlugin );

test( 'Test CLI @Critical', async ( { page, cli } ) => {
	await cli.setWpConst( { WP_DEBUG: true } );
	await cli.isPluginInstalled( 'mollie-payments-for-woocommerce' );
	const status = await cli.getPluginStatus( 'mollie-payments-for-woocommerce' );
	expect( status, 'Assert plugin is active' ).toBe( 'active' );

	const now = Date.now();
	const postTitle = `Test post ${ now }`;
	const postId = await cli.postCreate( {
		post_type: 'post',
		post_title: postTitle,
		post_status: 'publish',
	} );
	console.log( 'Post ID:', JSON.stringify( postId ) );
	
	await page.goto( `/` );
	await expect.soft(
		page.getByText( postTitle ).first(),
		'Assert post title',
	).toBeVisible();

	// Not working:
	await page.goto( `/test-post-${ now }/` );
	await expect.soft(
		page.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );

	await page.goto( `/?page_id=${ postId }` );
	await expect.soft(
		page.locator( 'h1' ),
		'Assert page heading',
	).toHaveText( postTitle );
} );