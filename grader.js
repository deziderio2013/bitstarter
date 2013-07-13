#!/usr/bin/env node

/*

Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

  + cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jdom/
    - http://maxogden.com/scrapping-with-node.html

  + commander.js
    - https://github.com/visionmedia/commander.js
    - http://tjholowaychuk.com/post/910188408/commander-js-nodejs-command-line-interfaces-made-easy

  + JSON
    - http://en.wikipedia.org/JSON
    - https://developer.mozilla.org/en-US/docs/JSON
    - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var rest               = require( 'restler' ) ;
var fs                 = require( 'fs' ) ;
var program            = require( 'commander' ) ;
var cheerio            = require( 'cheerio' ) ;
var HTMLFILE_DEFAULT   = "index.html" ;
var CHECKSFILE_DEFAULT = "checks.json" ;
var URL_DEFAULT        = "http://serene-reaches-5075.herokuapp.com/"


var assertURL          = function( url )
{
	return( url ) ;
} ;

var assertFileExists   = function( infile )
{
    if ( infile != null )
    {
    	var instr = infile.toString( ) ;

	if ( !fs.existsSync( instr ) )
    	{
		console.log( "%s does not exist. Exiting.", instr ) ;
		process.exit( 1 ) ; // http://nodejs.org/api/process.html#process_process_exit_code
    	}

	return( instr ) ;
    }


    return( null ) ;
} ;

var cheerioHtmlFile    = function( urldata, htmlfile )
{
    return( cheerio.load( urldata || fs.readFileSync( htmlfile ) ) ) ;
} ;


var loadChecks         = function( checksfile )
{
    return( JSON.parse( fs.readFileSync( checksfile ) ) ) ;
} ;

var checkHtmlFile      = function( urldata, htmlfile, checksfile )
{
             $ = cheerioHtmlFile( urldata, htmlfile ) ;
    var checks = loadChecks( checksfile ).sort( ) ;
    var out    = {} ;

    for( var ii in checks )
    {
	var present = $( checks[ ii ] ).length > 0 ;

	out[ checks[ ii ] ] = present ;
    }

    return( out ) ;
} ;

var clone              = function( fn )
{
    // Workaround for commander.js issue
    // http://stackoverflow.com/a/6772648

    return( fn.bind( {} ) ) ;
} ;


if ( require.main == module )
{
    program
        .option( '-c --checks <check_file>', 'Path to checks.json', clone( assertFileExists ), CHECKSFILE_DEFAULT )
        //.option( '-f, --file <html_file>', 'Path to index.html', clone( assertFileExists ), HTMLFILE_DEFAULT )
        .option( '-f, --file <html_file>', 'Path to index.html', clone( assertFileExists ), null )
	.option( '-u, --url <url_address>', 'URL address', clone( assertURL ), null )
        .parse( process.argv ) ;

    if ( program.file )
    {
    	var checkJson = checkHtmlFile( null, program.file, program.checks ) ;
    	var outJson   = JSON.stringify( checkJson, null, 4 ) ;

    	console.log( outJson ) ;
    }
    else if ( program.url )
    {
	rest.get( program.url ).on( 'complete', function( data )
		{

		    	var checkJson = checkHtmlFile( data, null, program.checks ) ;
    			var outJson   = JSON.stringify( checkJson, null, 4 ) ;

    			console.log( outJson ) ;
		} ) ;
    }
}
else
{
    exports.checkHtmlFile = checkHtmlFile ;
}

