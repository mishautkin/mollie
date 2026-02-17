/**
 * External dependencies
 */
import { exec, ExecOptionsWithStringEncoding } from 'child_process';
import util from 'util';
/**
 * Internal dependencies
 */
import { WpCliPostCreate, PostRelations } from './types';

/**
 * Base class for executing WP CLI commands.
 */
export abstract class WpCli {
	protected commandPrefix: string = '';
	protected commandPostfix: string = '';
	protected commandJoinChar: string = ' && ';
	protected execOptions: ExecOptionsWithStringEncoding = {};
	private readonly allowedWpConst = [
		'WP_DEBUG',
		'WP_DEBUG_DISPLAY',
		'WP_DEBUG_LOG',
		'SCRIPT_DEBUG',
	] as const;
	execPromise = util.promisify( exec );

	protected async execute( command: string | string[] ): Promise< string > {
		// Build wp commands
		const wpCommands = Array.isArray( command )
			? command
					.map( ( cmd ) => `wp ${ cmd }` )
					.join( this.commandJoinChar )
			: `wp ${ command }`;

		// Wrap with environment-specific prefix/postfix
		const finalCommand = `${ this.commandPrefix }${ wpCommands }${ this.commandPostfix }`;

		try {
			const { stdout, stderr } = await this.execPromise(
				finalCommand,
				this.execOptions
			);

			if ( stderr ) {
				console.error( `Execution Error: ${ stderr }` );
			}
			console.log( `stdout.trim: ${ stdout }` );
			return stdout.trim();
		} catch ( error: any ) {
			throw new Error(
				`Command execution failed: ${ error.message }\n` +
					`Command: ${ finalCommand }`
			);
		}
	}

	/**
	 * Clears SSE cache
	 */
	async clearSseCache() {
		return await this.execute( [
			'cache flush',
			'kinsta cache purge --all',
		] );
	}

	async isPluginInstalled( pluginSlug: string ) {
		return await this.execute( `plugin is-installed ${ pluginSlug }` );
	}
	
	async getPluginStatus( pluginSlug: string ) {
		return await this.execute( `plugin get ${ pluginSlug } --field=status` );
	}

	/**
	 * Creates post, page or custom post type (CPT).
	 *
	 * @param post - Object which contains params for creating a post
	 *
	 * @return Returns post id as string
	 */
	async postCreate( post: WpCliPostCreate ): Promise< string > {
		if ( post.post_content === undefined ) post.post_content = '';

		if ( post.post_excerpt === undefined ) post.post_excerpt = '';

		const command = `post create --post_type='${ post.post_type }' --post_title='${ post.post_title }' --post_status='${ post.post_status }' --post_content='${ post.post_content }' --post_excerpt='${ post.post_excerpt }' --porcelain`;

		return await this.execute( command );
	}

	// /**
	//  *
	//  * @param term - Object which contains params for creating the term
	//  * @return Returns term id
	//  */
	// async createTerm( term: Taxonomy.CreateTerm ): Promise< string > {
	// 	if ( term.parent === undefined ) term.parent = '';

	// 	if ( term.description === undefined ) term.description = '';

	// 	if ( term.slug === undefined ) term.slug = '';

	// 	const command = `term create ${ term.taxonomy } ${ term.name } --description=${ term.description } --parent=${ term.parent } --slug=${ term.slug } --porcelain`;

	// 	return await this.execute( command );
	// }

	// /**
	//  * It sets term id to a post id, of specific taxonomy
	//  *
	//  * @param data - Object which contains params for seting a term to post, by ID
	//  * @return - Returns a success message
	//  */
	// async setTermToPost( data: Taxonomy.SetTermToPost ): Promise< string > {
	// 	const command = `post term set ${ data.postIds.join( ' ' ) } ${
	// 		data.taxonomy
	// 	} ${ data.termId } --by=id`;

	// 	return await this.execute( command );
	// }

	/**
	 * Sets relation to a post.
	 *
	 * @param data - Object which contains params for seting a relation to a post
	 * @return - Returns a success message
	 */
	async setRelationToPost( data: PostRelations ): Promise< string > {
		const updateRelationType = `post meta update ${ data.postId } relation_type ${ data.postType }`;
		await this.execute( updateRelationType );

		const setRelation = `post meta update ${ data.postId } relation ${ data.relatedPostId }`;
		return await this.execute( setRelation );
	}

	/**
	 * Sets a parent post to one or multiple posts
	 *
	 * @param postIds
	 * @param parentPostId
	 * @return - Returns a success message
	 */
	async setParentToPosts( postIds: string[], parentPostId: string ) {
		const command = `post update ${ postIds.join(
			' '
		) } --post_parent=${ parentPostId }`;

		return await this.execute( command );
	}

	/**
	 * Remove parent post, from one or multiple posts
	 *
	 * @param postIds
	 * @return - Returns a success message
	 */
	async removeParentFromPosts( postIds: string[] ) {
		const command = `post update ${ postIds.join( ' ' ) } --post_parent=0`;
		return await this.execute( command );
	}

	/**
	 * Sets a term as parent, to other terms - one or multiple
	 *
	 * @param taxonomy
	 * @param termIds
	 * @param parentTermId
	 * @return - Returns a success message
	 */
	async setParentToTerms(
		taxonomy: string,
		termIds: string[],
		parentTermId: string
	) {
		const command = `term update ${ taxonomy } ${ termIds.join(
			' '
		) } --parent=${ parentTermId }`;

		return await this.execute( command );
	}

	/**
	 * Set same featured image to one or multiple posts
	 *
	 * @param postIds
	 * @param attachmentId
	 * @return - Returns a success message
	 */
	async setFeaturedImageToPosts( postIds: string[], attachmentId: string ) {
		const command = `post meta update ${ postIds.join(
			' '
		) } _thumbnail_id ${ attachmentId }`;

		return await this.execute( command );
	}

	/**
	 * Deletes one or more posts/pages, by ids
	 *
	 * @param postIds        - Can be one id, or more ids, in type string[], to be deleted. Example: ['6256', '6543']
	 *
	 * @param skipTrash      - If wanting to skip trash(post not sent to trash but deleted permanently), we set this param to true. Otherwise false.
	 *
	 * @param deferTermCount - Enables or disables term counting. Example: true
	 *
	 * @return - Returns message
	 *
	 * @example - Returns message example: "Success: Deleted post 112."
	 */
	async postDelete(
		postIds: string[],
		skipTrash: boolean = false,
		deferTermCount: boolean = false
	): Promise< string > {
		const command = `post delete ${ postIds.join( ' ' ) } ${
			skipTrash ? '--force' : ''
		} ${ deferTermCount ? '--defer-term-counting' : '' }`;

		return await this.execute( command );
	}

	/**
	 * Deletes one or more CPTs, by IDs. WP CLI has here a restriction and if --force is not set, the delete command will not delete a CPT post due missing trash.
	 *
	 * @param postIds        - Can be one or more CPT IDs, in type string[], to be deleted. Example: ['6256']
	 *
	 * @param deferTermCount - Enables or disables term counting. Example: true
	 *
	 * @return - Returns message example: "Success: Deleted post 112."
	 */
	async cusomPostTypePostDelete(
		postIds: string[],
		deferTermCount: boolean = false
	): Promise< string > {
		const command = `post delete ${ postIds.join( ' ' ) } --force ${
			deferTermCount ? '--defer-term-counting' : ''
		}`;

		return await this.execute( command );
	}

	/**
	 * Delete term by id and taxonomy name
	 *
	 * @param termId   - Term id. Example: '123'
	 *
	 * @param taxonomy - Taxonomy name. Example 'category', 'news-category'
	 *
	 * @return - Returns message
	 *
	 * @example - Returns message example: "Success: Deleted term 112."
	 */
	async termDelete( termId: string, taxonomy: string ): Promise< string > {
		const command = `term delete ${ taxonomy } ${ termId }`;

		return await this.execute( command );
	}

	/**
	 * Deletes all pages from PAGES, and deletes also from trash
	 *
	 * @param postType - post type that you want to delete. Example 'page', 'post'
	 *
	 * @return - Returns message
	 *
	 * @example - Returned message example: "Success: Deleted post 1268. Success: Deleted post 1294."
	 */
	async postDeleteAll( postType: string ): Promise< string > {
		//Delete all pages and move them in trash
		const deleteAllPosts = `post delete $(wp post list --post_type=${ postType } --format=ids)`;
		await this.execute( deleteAllPosts );

		//Delete all pages from trash
		const deleteAllPostsFromTrash = `post delete $(wp post list --post_status=trash --format=ids)`;
		return await this.execute( deleteAllPostsFromTrash );
	}

	/**
	 * Sets WP constant(s) value(s)
	 * For security reasons the list of allowed constants
	 * is limited to this.allowedWpConst
	 *
	 * @param data for example {
	 *             WP_DEBUG: true,
	 *             SCRIPT_DEBUG: false,
	 *             }
	 */
	async setWpConst(
		data: Partial< Record< typeof this.allowedWpConst[ number ], boolean > >
	) {
		const entries = Object.entries( data ) as [
			typeof this.allowedWpConst[ number ],
			boolean
		][];

		for ( const [ constant ] of entries ) {
			if ( ! this.allowedWpConst.includes( constant ) ) {
				throw new Error( `Invalid constant: ${ constant }` );
			}
		}

		const commands = entries.map(
			( [ constant, value ] ) =>
				`config set ${ constant } ${ value } --raw`
		);

		return await this.execute( commands );
	}
}
