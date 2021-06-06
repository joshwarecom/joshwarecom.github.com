! vim: set syntax=inform:
!
! Copyright (C) 2003,2004 Simon Baldwin (simon_baldwin@yahoo.com)
!
! This program is free software; you can redistribute it and/or modify
! it under the terms of the GNU Lesser General Public License as published
! by the Free Software Foundation; either version 2.1 of the License, or
! (at your option) any later version.
!
! This program is distributed in the hope that it will be useful,
! but WITHOUT ANY WARRANTY; without even the implied warranty of
! MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
! GNU Lesser General Public License for more details.
!
! You should have received a copy of the GNU Lesser General Public
! License along with this program; if not, write to the Free Software
! Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
!

!-----------------------------------------------------------------------------
!
! Introduction
!
! This library extension adds a reasonably well featured form of HTML-like
! markup to Z-machine and Glulx Inform games.  It also tackles some of the
! problems of writing non-English games that are portable across these two
! systems.
!
! Markup has the following goals:
!
!   o Make it easy to use text styles and formats without worrying about the
!     underlying details of the system being used.  Style and font commands
!     can differ across the systems, and Glk function calls to set particular
!     styles won't work with the Z-machine.  Markup offers its own way of
!     setting text styles, and converts them to the best representation it
!     can find for whichever system you are using.
!
!   o Make it easier to use some of the extended features available to a
!     Glulx game, without the full complexity of Glk programming.  With
!     Markup, you can include images with a simple markup tag in output text,
!     and avoid tricky function calls.
!
!   o Provide a standardized mechanism for international characters.  In
!     standard Inform, there is no overlap between the way that Z-machine and
!     Glulx represent non-English characters.  The @@ escape sequences of the
!     Z-machine don't always work in Glulx Inform, and @@ internal character
!     codes, while they work in both, work differently because the two use
!     different internal character representation.  Markup implements HTML
!     character entities, and translates them into the correct character for
!     the system you are using.
!
! Writing a game is intrinsically a textual exercise.  Using Markup gives
! authors an easy way to add style and other elements to the game, without
! breaking up the flow of the actual game text, and knowing that their game
! code will behave well on both Z-machine and Glulx interpreters.
!
! Markup offers text styles, text formatting, and HTML character entities,
! and can include images and hyperlinks in output text for interpreters that
! support these features.  It understands enough HTML to be able to take a
! section of a simple HTML file and make a reasonable job of displaying it.
!
!
! Getting Started
!
! Copy Markup.h to your Inform libraries directory, and Include "Markup"
! somewhere in your game.  A good place to add it would be just after your
! game includes "VerbLib".  Markup defines no entry points, which means that
! it won't conflict with other library extensions.  It also does not rely on
! any other library extensions; the normal Inform library is all it needs.
!
! To filter output strings through Markup, use the "markup" function, for
! example:
!
!     print (markup) "This string contains <EM>emphasized</EM> text.<br>";
!
! or alternatively
!
!     markup ("This string contains <EM>emphasized</EM> text.<br>");
!
! You can also set up Markup to filter every string that your game prints with
! the standard 'print' command, though this is a bit trickier to handle and
! somewhat hazardous.  See below for more.
!
! Markup is designed to be compact and efficient.  The Markup source file may
! look large, but more than one third of it is comments, and of the rest,
! half or so applies to either Glulx or the Z-machine, but not both.  So
! you're really getting less than a third of what you think you might have.
!
! Markup adds around 7.5Kb to a Z-machine game, and around 10Kb to a Glulx
! game.  For comparison, the standard Inform library is around 70Kb compiled
! for the Z-machine, and over 100Kb for Glulx.  Markup isn't that much extra.
! And if you want only character entities, you can build "Markup Lite", which
! reduces Markup to around 3.5Kb.  See the tuning section below for more.
!
!
! General Markup Usage
!
! Markup recognizes both character entities and formatting tags.  Entities
! start with '&' and end with ';', for example "&Eacute;".  Tags are always
! enclosed in '<' and '>' characters.
!
! While it's HTML-like, there are a few differences.  Firstly, an entity or
! tag cannot span calls to markup(), for example:
!
!     print (markup) "This is <B>val"; print (markup) "id</B> markup.<br>";
!     print (markup) "This is <B>invalid</"; print (markup) "B> markup.<br>";
!
! Secondly, there may be places where whitespace isn't permitted.  In tag
! parameters, for example, don't put spaces before or after the equals sign:
!
!     print (markup) "This <IMG SRC=PIC1 ALT=[PIC1]> is valid.<br>";
!     print (markup) "This <IMG SRC = PIC1 ALT = [PIC1]> is invalid.<br>";
!
! Thirdly, style tags aren't cumulative.  This may seem odd, but Glk text
! styles are mutually exclusive, and Z-machine styles have an extremely
! limited way in which they can combine.  By not making styles cumulative,
! Markup becomes simpler and faster.  For example:
!
!     print (markup) "This is <B><EM>not recommended</EM></B>.<br>";
!     print (markup) "This is <Q><EM>okay</EM></Q>.<br>";
!
! Finally, the tags in Markup are at times close to HTML ones, but often not
! identical.  Rather than try to map HTML into Glk and the Z-machine screen
! model, Markup instead exposes Glk and the Z-machine through HTML-like tags
! and entities.  Your favorite HTML tag could well be either missing, or not
! the same, in Markup.
!
! Markup and normal printing may be mixed freely:
!
!     print (markup) "^Here's <EM>some emphasized text,";
!     print " some more emphasized text,";
!     print (markup) "</EM> and normal text again.<br>";
!     print "Here's an ", (markup) "<EM>", "odd", (markup) "</EM>", " usage.^";
!
!
! Character Entities
!
! Markup supports all of the HTML special character entities, the HTML 2.0 and
! HTML 3.2 standard entities, and several additional widely implemented HTML
! character entities.
!
! Glulx understands all of these, as it uses ISO 8859-1 as its character
! representation.  However, a particular interpreter may not display all of
! them -- for some characters, it may emulate them in some way.  The Z-machine
! can display most of them, but some of them are not ZSCII, and so can't be
! printed.  For these, Markup may emulate them, for example "1/4" for frac14,
! or just print the character name instead.
!
! The full list of HTML character entities follows.  Character entity names
! are case-sensitive:
!
!   quot, amp, lt, gt, nbsp, iexcl, cent, pound, curren, yen, brvbar, brkbar,
!   sect, uml, die, copy, ordf, laquo, not, shy, reg, macr, hibar, deg,
!   plusmn, sup2, sup3, acute, micro, para, middot, cedil, sup1, ordm,
!   raquo, frac14, frac12, frac34, iquest, Agrave, Aacute, Acirc, Atilde, Auml,
!   Aring, AElig, Ccedil, Egrave, Eacute, Ecirc, Euml, Igrave, Iacute, Icirc,
!   Iuml, ETH, Dstrok, Ntilde, Ograve, Oacute, Ocirc, Otilde, Ouml, times,
!   Oslash, Ugrave, Uacute, Ucirc, Uuml, Yacute, THORN, szlig, agrave, aacute,
!   acirc, atilde, auml, aring, aelig, ccedil, egrave, eacute, ecirc, euml,
!   igrave, iacute, icirc, iuml, eth, ntilde, ograve, oacute, ocirc, otilde,
!   ouml, divide, oslash, ugrave, uacute, ucirc, uuml, yacute, thorn, yuml
!
! For example:
!
!     print (markup) "The C-cedilla looks like &Ccedil;, and &ccedil;.<br>";
!     print (markup) "Use &amp;amp; to print an ampersand (&amp;).<br>";
!     print (markup) "Use &amp;lt; and &amp;gt; for &lt; and &gt.<br>";
!
! The Z-machine cannot display the following character entities:
!
!   curren, sect, uml, ordf, not, macr, deg, sup2, sup3, para, middot, cedil,
!   sup1, ordm
!
! and Markup ignores these entities in Z-machine builds.  The Z-machine also
! lacks these character entities, which Markup emulates for it:
!
!   yen, brvbar, shy, reg, plusmn, acute, micro, frac14, frac12, frac34,
!   times, divide, cent
!
! Markup has four additional entities to handle characters in strings that the
! Inform compiler otherwise regards as special:
!
!   caret, tilde, at, backsl
!
! and two additional entries that the Z-machine has and Glulx does not (for
! these, Markup emulates the characters for Glulx):
!
!   OElig, oelig
!
! You can also specify character entities numerically using "&#...;".  The
! code is one, two, or three digits, indicating the decimal value of the
! character in the ISO 8859-1 (Latin-1) character set:
!
!     print (markup) "Ampersand is also &#38;.<br>";
!
! Numeric codes for Markup are always ISO 8859-1.  For Glulx, this is the
! native character representation; for the Z-machine, Markup will translate
! numeric codes into ZSCII where possible (conversion isn't a problem for the
! accented international characters, all of which have ZSCII equivalents).
!
!
! Text Styles and Colors
!
! The following table shows the HTML-like text styles offered by Markup, and
! the way in which it maps each to Glk style, or Z-machine font and style
! commands, as appropriate:
!
!     Style tag               Usage          Glk style     Z-machine font/style
!     ---------               -----          ---------     --------------------
!     <b>...</b>              Bold           Alert         On, Bold
!     <strong>...</strong>    Strong         ditto         ditto
!     <i>...</i>              Italics        Emphasized    On, Underline
!     <em>...</em>            Emphasized     ditto         ditto
!     <dfn>...</dfn>          Definition     ditto         ditto
!     <address>...</address>  Address        ditto         ditto
!     <u>...</u>              Underlines     Note          On, Underline
!     <tt>...</tt>            Monospaced     Preformatted  Off, Roman
!     <pre>...</pre>          Preformatted   ditto         ditto
!     <code>...</code>        Code           ditto         ditto
!     <kbd>...</kbd>          Keyboard       ditto         ditto
!     <var>...</var>          Variable name  ditto         ditto
!     <samp>...</samp>        Sample         ditto         ditto
!     <quote>...</quote>      Quote          BlockQuote    On, Reverse
!     <cite>...</cite>        Cite           ditto         ditto
!     <h1>...</h1>            Major heading  Header        On, Bold+Reverse
!     <h2>...</h2>            Sub heading    Subheader     On, Bold
!
! All this is just a long winded way of saying that you can use HTML-like
! style tags in your game, and Markup will try to do a reasonable job of
! translating them into something suitable for the interpreter that you are
! using.
!
! Style tags are case-insensitive.  Styles aren't cumulative, so these tags
! don't work in combination.  They can however be nested, in which case the
! innermost takes effect, and on exit from it all style reverts to whatever
! was set on entry.  (For what it's worth, all of the above </...> tags do the
! exact same thing, that is, return to the style set on entry to the tagged
! section.)
!
! Markup also offers directly named access to Glk and Z-machine styles, just
! another way of achieving the same effect:
!
!     <alert>...</alert>               displays on Z-machine as Bold
!     <blockquote>...</blockquote>     displays on Z-machine as Reverse
!     <emphasized>...</emphasized>     displays on Z-machine as Bold
!     <header>...</header>             displays on Z-machine as Bold+Reverse
!     <input>...</input>               displays on Z-machine as Underline
!     <note>...</note>                 displays on Z-machine as Reverse
!     <preformatted>...</preformatted> displays on Z-machine as font Off, Roman
!     <subheader>...</subheader>       displays on Z-machine to Bold
!     <user1>...</user1>               displays on Z-machine as Roman
!     <user2>...</user2>               displays on Z-machine as Roman
!
!     <bold>...</bold>                 displays on Glulx as Subheader
!     <reverse>...</reverse>           displays on Glulx as Emphasized
!     <underline>...</underline>       displays on Glulx as Emphasized
!     <xbold>...</xbold>               displays on Glulx as Preformatted
!     <xreverse>...</xreverse>         displays on Glulx as Preformatted
!     <xroman>...</xroman>             displays on Glulx as Preformatted
!     <xunderline>...</xunderline>     displays on Glulx as Preformatted
!
! and with the same nesting limitations.  Markup doesn't set up either of the
! two Glk user-defined styles, so if you want to use them, you'll need to
! either set them up yourself, or use JustEnoughGlulx to do it for you.
!
! The Z-machine <x...> styles are a few selected combination styles.  These
! are fixed width with some additional styling.  Because styles are not
! cumulative in Markup, these provide a somewhat untidy way to get fixed width
! text with attributes, for Z-machine interpreters that support cumulative
! styles (and many don't; the Z-machine specification does not require it).
! You'll need to bypass Markup if you want fancier styles.  Sorry for the
! ugliness.
!
! The <font ...> tag offers access to the Z-machine text colors.  Glulx Markup
! will ignore font tags, as Glulx offers no direct control over text color.
!
! The <font ...> tag has two parameters: the foreground color, and the
! background color, for example:
!
!     markup ("The Z-machine may do <font color=red bgcolor=cyan>red</font>.");
!
! Both parameters are optional, but giving neither isn't useful.  Font color
! tags nest, but if you nest them and you change background colors, you'll
! want to specify both foreground and background colors with each call,
! because of a restriction in the way that Markup stacks font colors.  Valid
! color values are:
!
!     default (the window's default color), black, red, green, yellow, blue,
!     magenta, cyan, white
!
! or you can also give colors numerically using Z-machine numbers, where black
! is 2, red 3, and so on.
!
! When changing only the foreground color, Markup allows a shorthand, letting
! you use the color names black, red, green, yellow, blue, magenta, cyan, and
! white as simple tags.  The following are equivalent:
!
!     markup ("On the Z-machine this is <red>red</red> text.<br>");
!     markup ("On the Z-machine this is <font color=red>red</font> text.<br>");
!
! Some game interpreters may not implement styles, colors, or both, so try to
! ensure that your game does not rely on them.  Remember that Glulx Markup
! does not support text colors at all.
!
!
! Text Formatting
!
! The following HTML-like tags control text formatting:
!
!     <br>                    Line break, prints a newline, equivalent to "^"
!     <p>...[</p>]            Paragraph, separates by a blank line; <p> is
!                             equivalent to <br><br>, the </p> is optional
!     <q>...</q>              Enclose text in quotes; this is borrowed from
!                             TADS, and encloses text in quotation marks,
!                             alternating double and single quotes when nested
!     <cls>                   Clear the screen; borrowed from Adrift, and
!                             has <clear> as a synonym
!     <!-- ... -->            HTML comment tag; note that the !-- must be
!                             followed by a space
!
! In addition, Markup offers:
!
!     <glulx>...</glulx>      Output only in Glulx interpreters; the text
!                             between the tags is not shown on the Z-machine
!     <zcode>...</zcode>      Output only in Z-machine interpreters; the text
!                             between the tags is not shown in Glulx
!
! Text formatting tags are case-insensitive.  For example:
!
!     print (markup) "<CLS>Clear screen.<p>New paragraph.<Br>Done.<br>";
!
! One slight wrinkle with the <cls ...> tag.  On the Z-machine, there is no
! way to determine which window is current.  In normal use, it's window 0,
! and this is the one that Markup will clear.  However, if your game does
! something special with windows, you may need to tell Markup which window to
! clear with a WINDOW= parameter that gives the window number.  If you don't
! give this, Markup will clear window 0, right 99% of the time.  In Glulx
! Markup, any WINDOW= is simply ignored.
!
! With the <glulx>...</glulx> and <zcode>...</zcode> tags, the enclosed text
! takes up space in the compiled game for both Glulx and Z-machine builds,
! but prints on only one type of interpreter.  This is different from using
! #Ifdef TARGET_GLULX or TARGET_ZCODE, where enclosed text is compiled into
! the game only for the relevant target system.  Using these tags only for
! relatively short pieces of text will avoid keeping too much unnecessary
! text in the compiled game.
!
!
! Delays, Keypresses, and Line Input
!
! You can use the <wait ...> tag, borrowed from Adrift, to delay for a short
! period.  Give the delay, in milliseconds, with the DELAY= parameter, for
! example, to delay for one and a half seconds:
!
!     <wait delay=1500>
!
! The default delay, where no DELAY= parameter is given, is one second.  Wait
! with a delay of zero returns immediately.
!
! You can also use the <waitkey ...> tag, again borrowed from Adrift, to wait
! for a keypress, optionally with a timeout.  For example, to wait for a
! keypress and timeout after three seconds:
!
!     <waitkey delay=3000>
!
! If the DELAY= parameter is omitted or zero, <waitkey ...> will not timeout,
! but wait until a key is pressed, forever if necessary.  If you want to know
! the key pressed, the value is in the global variable markup_waitkey.  A
! value of zero indicates that the waitkey timed out, otherwise the value is
! either the key code, or one of the special Glk keys defined as keycode_* in
! infglk.h.  For Glulx Markup, the key code is the ISO 8859-1 character; for
! Z-machine markup, it is the ZSCII character.  The exceptions are the special
! Glk keys -- Markup returns the same values on both platforms:
!
!     left, right, up, and down arrow keys    -2, -3, -4, and -5
!     return                                  -6
!     delete, escape, and tab                 -7, -8, -9
!     F1 to F12                               -17 to -28
!
! It does this so that game code can check for a return of say -17 (F1) on
! both Glulx and Z-machine Markup, without worrying about inconveniences such
! as the F1 key usually being -17 on Glulx, and 133 on the Z-machine.  Also,
! as 7-bit ISO 8859-1 (ASCII) matches 7-bit ZSCII for characters 32 to 127,
! these characters will also be the same on both platforms in markup_waitkey
! (for example, space is 32 on both).
!
! The <waitline ...> tag waits for a complete input line.  You can set a
! timeout with DELAY=, and if omitted, it waits forever for an input line.
! You can also give an initial value for the input line with INITIAL=, for
! example:
!
!     <waitline initial='Quit' delay=4500>
!
! The line typed can be found in the global variable markup_waitline.  This
! is an Inform string array, that is, the first element markup_waitline->0
! contains the length of the string, and the characters are in the elements
! markup_waitline->1 to markup_waitline->(markup_waitline->0).  A length of
! zero indicates that either the waitline timed out, or the user entered an
! empty, zero length string.
!
! If the initial string contains spaces or the '>' character, it needs to be
! enclosed in single quotes.  Otherwise it can be entered without quotes.
! Initial strings cannot contain markup.
!
! You can use the <readline ...> tag as a synonym for waitline.  For all of
! the above tags, TIMEOUT= is a synonym for DELAY=, and DEFAULT= a synonym
! for INITIAL=.
!
! Some game interpreters may not support timers.  For these interpreters,
! the <wait ...> tag is always ignored, and <waitkey ...> and <waitline ...>
! will never timeout.  Your game should not rely on these delays and timeouts.
! A few game interpreters may also not implement INITIAL= on <waitline ...>.
!
!
! The Image Tag
!
! If your Glk library is capable of displaying images in a text buffer window,
! Markup's <img ...> tag may offer a convenient way to display pictures.  This
! tag is not supported by Z-machine Markup, which displays only the alternate
! image text when present.
!
! The general form of the <img ...> tag is:
!
!     <img src=PIC1 width=32 height=32 align=bottom alt='Picture 1'>
!
! Tag parameters can be given in any order.  If any is given more than once,
! the last one given is used.  Of all the parameters, only the SRC= one is
! required, the others are all optional.
!
! For example, to simply display an image:
!
!     print (markup) "<img src=PIC1><br>";
!
! To add alternate text for Glk libraries that cannot display pictures:
!
!     print (markup) "<img src=PIC1 alt='(Picture 1 would go here)'><br>";
!
! To scale an image, and align text to its middle:
!
!     print (markup) "<img src=PIC1 width=99 height=99 align=middle><br>";
!
! To provide an illuminated 'H' to start a paragraph:
!
!     print (markup) "<p><img src=PIC8 align=bottom alt=H>ere ...";
!
! If a parameter contains spaces or the '>' character, it needs to be enclosed
! in single quotes.  Otherwise it can be entered without quotes.  Typically,
! ALT= is the only parameter that would need to be quoted.  ALT= strings may
! include markup, for example, a slightly better illuminated 'H':
!
!     print (markup) "<p><img src=PIC8 align=bottom alt='<H1>H</H1>'>ere ...";
!
! For the SRC= parameter, Markup finds the first string of numeric characters
! in the value, and uses this as the resource number for the image.  All other
! characters in the value are ignored.  All of the following are equivalent:
!
!     print (markup) "<img src=PIC1><br>";
!     print (markup) "<img src=1><br>";
!     print (markup) "<img src='IMAGE1.PNG'><br>";
!     print (markup) "<img src='     1     '><br>";
!
! For the ALIGN= parameter, Markup takes the following values:
!
!     bottom                  Align text to the image bottom (Glk InlineUp)
!     top                     Align text to the image top (Glk InlineDown)
!     left                    Place image at window left (Glk MarginLeft)
!     right                   Place image at window right (Glk MarginRight)
!     middle, center, centre  Align text to the image middle (Glk InlineCenter)
!
! ALIGN= values are case-insensitive.  If none is given, or if the value
! given isn't one of the valid ones, Markup defaults to "bottom".  For "left"
! and "right", Markup will generate a Glk flow break before displaying the
! image.  Also, note that for "left" and "right", Glk requires that the
! current text printing position must be at the start of a line (that is, you
! need to output "<br>", "<p>", or print "^" right before an <img> tag that
! uses either left or right margin alignment).
!
! Consult the documentation for your Glulx interpreter and your favorite Blorb
! tool for details on how to get images built into the game with the right
! resource numbers.
!
! Some game interpreters may not be able to display images, so make sure that
! your game does not rely on them, or if it does, test for image display in
! the interpreter at the start of the game with a Glk "gestalt" call.
!
!
! The Anchor Tag
!
! Some Glk libraries offer a form of hyperlinks, and if your's does, then
! Markup's <a ...> tag offers a shorthand way to display hyperlinks.  This tag
! is not supported by Z-machine Markup, which will ignore it (though not, of
! course, the actual text between the start and end tags).
!
! The anchor tag has one mandatory parameter, HREF=, for example:
!
!     <a href=1>link text</a>
!
! The value of HREF= is the link number that Glk will return in the Glk event
! structure if the link is activated, and must be greater than zero.  HREF=
! behaves in the same way as SRC= above for image tags, that is, only its
! numeric characters are used.
!
! By itself, this tag is not terribly useful.  It becomes useful only when
! the game has code in it to listen for hyperlink events, in order to attach
! actions to the links.
!
! Some game interpreters may not offer hyperlinks, so make sure that your
! game has other ways of letting the player use any actions you attach to
! hyperlinks.  The <a ...> tag does not nest in Markup.
!
!
! Game Information
!
! The <release>, <serial>, and <version> tags print out the game's release
! and serial number, for example:
!
!     print (markup) "This is <H1>", (string) Story,
!           (markup) "</H1>, release <release>,",
!           (markup) "serial number <serial>,",
!           (markup) "Inform version <version>.<br><br>";
!
! There's no tag to output the game's name; use "(string) Story" instead.
! Similarly, use "(string) LibRelease" for the library release number.
!
!
! Full Markup Reset
!
! On occasions it may be useful to fully reset Markup, closing any and all
! set styles and colors, any open hyperlink and quotes, turning off any
! VM-specific output suppression, and also emptying Markup's record of nested
! styles and colors.
!
! To do this, enclose a section of text in <markup>...</markup> tags.  On
! the </markup>, Markup will reset to its default initial conditions.  For
! example:
!
!     print (markup) "This is normal text, <markup><q>this is quoted, ",
!           (markup) "<em>this is emphasized text, <red>this red, ",
!           (markup) "<b>this bold, <a href=1>this is a hyperlink, ",
!           (markup) "<zcode>this is hidden on a Glulx interpreter, ",
!           (markup) "</markup>and this is back to normal.<br>";
!
! Unlike most other tags, <markup>...</markup> do not nest.  On seeing a
! </markup> tag, Markup always fully resets itself to its initial settings.
!
!
! Filtering a String or Memory Buffer
!
! Markup can also filter text held in either an Inform 'string' type, or held
! in a raw memory buffer.  The function to call is markup_printfilter(), and
! it takes two arguments -- the "address" of the data to print, and length.
! For example, to filter a 'string' type:
!
!     Array my_string string "This is <EM>emphasized</EM> text.<br>";
!     ...
!     markup_printfilter (my_string + 1, my_string->0);
!
! To read a line from a Glk stream and filter it:
!
!     Array my_buffer -> 1024;
!     ...
!     len = glk_get_line_stream (my_stream, my_buffer, 1024);
!     markup_printfilter (my_buffer, len);
!
!
! Filtering All Printed Output
!
! You can mark sections of your game so that everything that you print with
! a standard 'print' statement is filtered for markup.  This might be useful
! if you are adding Markup to existing code, or just for the additional
! comfort of using familiar print calls.
!
! You should however use it only if you're sure of what you are doing.  It's
! a bit tricky to manage the interactions between Markup and other parts of
! the Inform library when you use this feature, and easy to make a mistake
! with it that will stop your game from running correctly.  And for all that,
! you get little that you don't already have with explicit markup.
!
! To filter standard 'print' output, tell Markup where the section starts and
! ends with the markup_start() and markup_end() functions.  For example:
!
!     markup_start ();
!     print "This string contains <EM>emphasized</EM> text.<br>";
!     print "This string contains <IMG SRC=PIC1> an image.<br>";
!     markup_end ();
!
! It's vital here that you call markup_end() at the end of the markup section,
! before returning to the Inform library.  The markup_start() function
! redirects all printed output into Markup, and this can confuse the library
! if left this way when a game function returns.
!
! To be safe, use only 'print' statements between markup_start() and
! markup_end(), and always call these two functions in pairs, preferably
! within the same routine.  Markup sections are probably used to best effect
! in routines that consist of nothing but 'print' statements, perhaps the
! credits or "about" functions, or for very lengthy descriptions or other
! long text sections.
!
! The symptoms of failing to call markup_end() include no longer seeing a game
! input prompt, no status line updates, Glulx fatal error saving or loading a
! game, Z-machine crash or hang, and other odd effects.  One advantage of
! markup sections is that character entities and tags can span several calls
! to 'print'.
!
! Glulx Markup buffers the printed text, and only flushes and filters output
! either when the buffer is full, or when it sees a '>' or ';' character, a
! probable end of tag or character entity.  It's possible that you may run
! into problems with this buffer flushing if you put '>' or ';' characters
! inside a tag.  This might occur with the ALT= parameter to the <img ...>
! tag, or the INITIAL= parameter to the <waitline ...> tag.  So in general,
! either avoid these two characters with ALT= and INITIAL= if using markup
! sections, or avoid markup sections if using either of these two characters
! with ALT= or INITIAL=.
!
! Z-machine Markup buffers the printed text, but has no way of monitoring each
! character, nor any way to tell if the buffer is full.  If using markup
! sections on the Z-machine, be very careful not to output more characters
! than the Markup buffer can hold in a single section.
!
! If you call 'markup("...")' or 'print (markup) "..." explicitly inside
! markup sections, the call will behave as if you had simply called 'print'.
! Any markup in the string will work as expected.
!
! In practice, markup sections offer little more than the ability to omit the
! '(markup)' on 'print' statements, and unless there's a good reason to use
! them, it's probably safer, better, and clearer to stick with explicit calls
! to markup.
!
!
! Examples and Test Suite
!
! The file Markup_test.inf contains a small test suite for Markup.  If you are
! having problems working out how to use it, or what's going wrong with what
! you are trying, this would be a good place to look for functioning code.
!
! The code in Markup_test.inf compiles and runs on both Glulx and Z-machine.
! The only test that cannot run on the Z-machine is reading markup from a file.
!
!
! Miscellaneous
!
! If you're confused by character entities, or markup in general, a good HTML
! reference book should help out.
!
! Markup is limited to ISO-8859 Latin-1 characters.  Its character entities
! are correct only for the default ZSCII accented character tables for
! Latin-1 source files.  That is, either omit the -C Inform compiler option
! or use only -C1, and do not replace characters in the ZSCII table using the
! Zcharacter directive.  Or if you do, do not use Markup character entities.
!
! Roger Firth's excellent Inform pages contain copious detail on the problems
! associated with trying to create a single game source that works on both
! Z-machine and Glulx VMs and that contains non-English characters.  Markup
! attempts to tackle some of these problems.
!
! Some game interpreters may handle only a subset of Glk or Z-machine styles,
! perhaps none at all.  An interpreter also may not have timers, or for Glulx,
! images or hyperlinks.  Make sure that your game doesn't rely on any of these
! features.
!
! Markup's reaction to invalid or incorrect markup is usually to either ignore
! it, or print it verbatim.  This is common to most markup rendering schemes,
! but it does make it hard sometimes to see why something might not be working.
!
! Markup gives a few warning of error conditions in strict mode compiles, and
! is silent otherwise.
!
! There is no sound tag in Markup.  This is because sound in Glk is not
! initialized by the bi-platform library, and so can't be made stateless in
! Markup.  It's omitted with a small amount of regret.
!
! Markup offers only what Glk and the Z-machine allow it to control about
! styles and text appearance.  In particular, there is no way to set font
! sizes or font faces, and foreground or background colors work only in
! Z-machine Markup (and even then, not on all interpreters).
!
! When building for the Z-machine, Markup requires at least Version 5.  When
! used in Version 6 games, Markup makes no use of the Version 6 graphics
! capabilities.
!
! In normal use, Markup adds no visible delay to text display when compiled
! without strict mode (that is, ~-S).  In strict mode, and where markup is
! very heavily used, you may notice a slight slowing of text output caused by
! Inform's array bounds checking.
!
! Markup could potentially use Unicode to provide the Z-machine versions of
! the missing character entities, but it doesn't.  There are two reasons.
! Firstly, Unicode output isn't really Unicode when the output stream is
! redirected to a buffer, and Markup relies on redirected streams throughout.
! And secondly, not all Z-machine interpreters can handle Unicode; worse,
! many that claim that they do, don't do it right.
!
!
! Icky Tuning and Other Details
!
! If your game doesn't go far outside the standard feature set provided by
! the Inform library, and if you don't need to, say, filter extremely long
! strings, you can safely ignore the rest of this section.
!
! Otherwise, there may be stuff below that you want to know.
!
! By default, Markup can handle up to 1024 characters in a single call.  If
! the string passed in is longer than this, it will be truncated.  If this
! isn't long enough, define the constant MARKUP_BUFFER_SIZE before including
! Markup in your game.  In Glulx, you can pass Markup an ordinary string, a
! C-style string (that is, $E0,...,$0), or anything else the bi-platform
! library's PrintAnyToArray can handle (for example, a function call with
! arguments, an object property, or the name of an object); in Z-machine,
! you can pass Markup an ordinary string, an object, or a function call with
! arguments.  The results of some of these arguments may be longer than 1024
! characters, and might exhaust the buffer.  Defining a really large buffer,
! say 10kb or more, will work fine, though it will of course use memory from
! the interpreter, giving the game a larger "footprint".
!
! In Glulx Markup, the delay tags <wait ...> and <waitkey ...> catch and
! handle Glk events.  If your game needs to know about these events, define
! the constant MARKUP_HANDLE_GLK_EVENT before including Markup.  This will
! generate calls to the HandleGlkEvent() entry point for each event that
! Markup catches.
!
! The arguments to HandleGlkEvent are the event; a context value of 2 for
! calls from wait, 3 from waitkey, and 4 from waitline; and a third argument
! of the remaining wait time.  Markup uses these values to avoid conflicting
! with the bi-platform library, which passes context 0 from KeyboardPrimitive
! and 1 from KeyCharPrimitive.  If HandleGlkEvent() returns 2, Markup will
! cancel the <wait ...>, <waitkey ...>, or <waitline ...> immediately; if it
! returns -1, Markup will ignore the last timeout; for any other return,
! Markup proceeds with the wait as normal.  For the case of HandleGlkEvent()
! called with remaining wait time of zero, if HandleGlkEvent() returns 2,
! Markup will not cancel Glk timer events, assuming that HandleGlkEvent() set
! a new timer event period -- use this feature if your game needs to keep
! timer events running while using Markup input with timeout or delay tags.
!
! Markup doesn't call HandleGlkEvent() by default as a lax HandleGlkEvent()
! could be confused by unexpected context values.  Unless your game has
! special features, you shouldn't need to worry about HandleGlkEvent() at
! all.  One case where you might need it is if you use a graphics window; in
! this case, HandleGlkEvent() will need to handle graphics repaint on redraw
! or arrange events.
!
! Markup allows styles and font colors to nest to 16 levels.  If you need
! more than this, define the constant MARKUP_ATTRIBUTE_NESTING before
! including Markup.  Each defined nesting level consumes two bytes, so they
! don't cost you much.
!
! When compiling for the Z-machine, if you don't want Markup to convert
! "special" key codes returned by the <waitkey ...> tag into Glk ones,
! define a constant MARKUP_NO_GLK_KEY_CONVERSIONS before including Markup.
!
! It's possible to build "Markup Lite".  This offers character entities, but
! no tags, and might be useful if you want to just use Markup's feature to
! get uniform character representation across VMs, without any of the other
! features.  To build in this way, define a constant MARKUP_ENTITIES_ONLY
! before including Markup.  This reduces Markup's size in the compiled game
! to around 3.5Kb, on both Glulx and the Z-machine.
!
!
! Licensing
!
! Markup is released under version 2.1 of the GNU Lesser General Public
! License (LGPL):
!
!    This program is free software; you can redistribute it and/or
!    modify it under the terms of the GNU Lesser General Public License
!    as published by the Free Software Foundation; either version 2 of
!    the License, or (at your option) any later version.
!
!    This program is distributed in the hope that it will be useful,
!    but WITHOUT ANY WARRANTY; without even the implied warranty of
!    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
!    GNU Lesser General Public License for more details.
!
!    You should have received a copy of the GNU Lesser General Public
!    License along with this program; if not, write to the Free
!    Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
!    02111-1307  USA
!
! Generally, being LGPL'ed means that you can include Markup in your game,
! without needing to publish the game's source.  The LGPL explicitly permits
! code to be used in "non-free programs."  Just in case there's any other
! doubt, the LGPL includes the clause:
!
!   "14. If you wish to incorporate parts of the Library into other free
!        programs whose distribution conditions are incompatible with these,
!        write to the author to ask for permission."
!
! in which case, Markup comes with express permission for its use in Inform
! games for which the source is not published.  You may include Markup freely
! in Inform games without needing to make any of the rest of your game
! available.
!
!-----------------------------------------------------------------------------

System_file;

#Ifndef	WORDSIZE;
Constant	TARGET_ZCODE;
Constant	WORDSIZE	2;
#Endif;

#Ifndef	MARKUP_H;
Constant	MARKUP_H;
Message		"[Including Markup.]";

! Markup buffer length, tunable by defining before including Markup.
#Ifndef	MARKUP_BUFFER_SIZE;
Constant	MARKUP_BUFFER_SIZE		1024;
#Endif;

! Style and color nesting depth, tunable by defining before including Markup.
#Ifndef	MARKUP_ATTRIBUTE_NESTING;
Constant	MARKUP_ATTRIBUTE_NESTING	16;
#Endif;


!----------------------------------------------------------------------------
! Z-machine specific routines and tables.
!----------------------------------------------------------------------------
#Ifdef TARGET_ZCODE;

Constant	MARKUP_GLULX			false;

!
! markup_vm_to_lower()
! markup_vm_put_char()
! markup_vm_put_buffer()
!
! VM-specific primitives to convert to lowercase, output a character, and
! output a character buffer.
!
[ markup_vm_to_lower _char;

	! Convert to lowercase the "normal" way.  All conversions are for
	! standard 7-bit characters in entity and tag names and parameters,
	! so there's no need to account for accented characters here.
	if (_char >= 'A' && _char <= 'Z')
		return _char - 'A' + 'a';
	return _char;
];
[ markup_vm_put_char _char;

	! Convert to ZSCII if newline, then print the character.
	if (_char == 10)
		_char = 13;
	print (char) _char;
];
[ markup_vm_put_buffer buf len
	i;

	! Print each character in the string, the hard way.
	for (i = 0: i < len: i++)
		print (char) buf->i;
];


! Markup works primarily in ISO 8859-1, as it covers all of the characters
! we need for both VMs (when it includes the imposters "OElig" and "oelig").
! For the Z-machine, we use a lookup table to map ISO 8859-1 into ZSCII for
! characters 160 and above.  The table contains zero where there is no ZSCII
! equivalent (that is, is unprintable on the Z-machine).  We handle "OElig"
! and "oelig" separately, outside table mapping.
Array	markup_vm_zscii_table	->
	  0 222   0 219   0   0   0   0   0   0   0 163   0   0   0   0
	  0   0   0   0   0   0   0   0   0   0   0 162   0   0   0 223
	186 175 196 208 158 202 212 214 187 176 197 167 188 177 198 168
	218 209 189 178 199 210 159   0 204 190 179 200 160 180 217 161
	181 169 191 205 155 201 211 213 182 170 192 164 183 171 193 165
	216 206 184 172 194 207 156   0 203 185 173 195 157 174 215 166;

!
! markup_vm_entity()
!
! VM-specific character entity backend.  The code argument is an ISO 8859-1
! character, and may need converting to ZSCII.
!
[ markup_vm_entity code
	zscii;

	! Decide what character range the character is in.  Based on that,
	! convert to ZSCII and print, or return false if unprintable.
	switch (code) {
			! Handle the out-of-table OElig and oelig here.
	140:		print (char) 221;		! OElig
	156:		print (char) 220;		! oelig
	
	32 to 127:	! ZSCII is equivalent to 7-bit ASCII in this range.
			print (char) code;

	160 to 255:
	switch (code) {
			! Fake a few of the more popular characters that
			! ISO 8859-1 has and the Z-machine lacks.  This is
			! not at all a full list of the missing ones.
	160:		print (char) ' ';				! nbsp
	162:		print (char) 'c';				! cent
	165:		print (char) 'Y';				! yen
	166:		print (char) '|';				! brvbar
	169:		print (char) '(', (char) 'C', (char) ')';	! copy
	173:		print (char) '-';				! shy
	174:		print (char) '(', (char) 'R', (char) ')';	! reg
	177:		print (char) '+', (char) '/', (char) '-';	! plusmn
	180:		print (char) 39;				! acute
	181:		print (char) 'u';				! micro
	188:		print (char) '1', (char) '/', (char) '4';	! frac14
	189:		print (char) '1', (char) '/', (char) '2';	! frac12
	190:		print (char) '3', (char) '/', (char) '4';	! frac34
	215:		print (char) 'x';				! times
	247:		print (char) '/';				! divide

	default:
			! Convert to ZSCII using the lookup table.  If no
			! equivalent, return false.  Otherwise, print the
			! equivalent ZSCII character.
			zscii = markup_vm_zscii_table->(code - 160);
			if (zscii == 0)
				return false;
			print (char) zscii;
	}

	default:	! Either not a valid ISO 8859-1 character, or a low
			! (control) value.  Unprintable.
			return false;
	}

	! ZSCII equivalent printed successfully.
	return true;
];


#Ifndef MARKUP_ENTITIES_ONLY;

!
! markup_vm_tag_cls()
!
! VM-specific clear screen tag backend.  A window number may (rarely) be
! passed in from the tag, otherwise, the main window is the one cleared.
!
[ markup_vm_tag_cls win;

	! In a version 6 game, -3 should be usable as a request to clear
	! the current window.  In this case, and only this case, we can
	! probably ignore the window argument.
	if (50->0 >= 1
			&& 0->0 == 6) {
		@erase_window -3;
		return;
	}

	! If window was not specified, clear the main window.  Otherwise
	! clear the given window.  Use @erase_window rather than 6.3 clear
	! screen statements for compatibility with pre-6.3 compilers.
	if (win == -1)
		@erase_window 0;
	else
		@erase_window win;
];


!
! markup_vm_tag_hyperlink()
! markup_vm_tag_img()
!
! Stub backend functions for unimplemented features in the Z-machine build.
! For hyperlinks, we do nothing.  For images, just print the alternate text.
!
[ markup_vm_tag_hyperlink href; href = 0;

	! Not implemented.  Nothing to do.
];
[ markup_vm_tag_img pic width height align altstr altlen;
	pic = width = height = align = 0;

	! Recursively filter any alternate text for the image.
	if (altlen > 0)
		markup_filter (altstr, altlen);
];


!
! markup_vm_tag_release()
! markup_vm_tag_serial()
! markup_vm_tag_version()
!
! Print out information about the loaded game and Inform compiler version.
!
[ markup_vm_tag_release;

	! Print the game release number from the header, in the same way
	! as the library does it.
	print (0-->1) & $03ff;
];
[ markup_vm_tag_serial;

	! Print the game serial number from the header, six bytes starting
	! at header byte 18.
	markup_vm_put_buffer (18, 6);
];
[ markup_vm_tag_version;

	! Print the Inform compiler version string.
	inversion;
];


! Table mapping style tag id's to Z-machine styles.  Entries marked 255 are
! for gaps in tag id numbering, and won't be used.  The table encodes font
! preformatting in bit 3, and style in bits 0 (bold), 1 (underline), and 2
! (reverse).  Style 0 is special -- revert to default.
Array	markup_vm_style_table ->
	  0   1   1   2   2   2   2   2   8   8   8   8   8   8   4   4	! HTML
	  5   1 255 255 255 255 255 255 255 255 255 255 255 255 255 255
	  1   4   1   5   2   4   8   1   0   0 255 255 255 255 255 255 ! Glk
	  1   4   2   9  12   8  10 255 255 255 255 255 255 255 255 255;! Z-Mac

!
! markup_vm_style()
!
! VM-specific handler for all style settings.  Code is the tag's id code.
!
[ markup_vm_style code
	_style;

	! Lookup the relevant Glk style for this tag.  If none, ignore the
	! call, otherwise set the style and return.
	_style = markup_vm_style_table->code;
	if (_style == 255)
		return;

	! Switch back to normal first to prevent styles accumulating.  Then
	! set up both font and style according to the style from the lookup.
	! If styles accumulate, it's on our terms only.
	font on; style roman;
	if (_style & 8)		font off;
	if (_style & 1)		style bold;
	if (_style & 2)		style underline;
	if (_style & 4)		style reverse;
];


!
! markup_vm_color()
!
! VM-specific function for setting text colors.  The color argument is a
! composite value, with foreground in the bottom halfbyte, and background
! in the top halfbyte.
!
[ markup_vm_color color
	fgcolor bgcolor;

	! Split color into foreground and background, and set them.  There
	! is no check for color setting; if not possible, the VM just won't
	! do it.
	fgcolor = color % 16;
	bgcolor = color / 16;

	! Set colour using the Z-machine opcode rather than the newer
	! Inform colour statements, for compatibility with pre-6.3
	! compilers.
	@set_colour fgcolor bgcolor;
];


!
! markup_vm_keycode_convert()
!
! Convert a few keycodes for the waitkey function, to allow user code to
! test for, say, Return with -6 (Glk keycode_Return) on either VM platform.
! We don't do international keys, only "special" and function keys.  The
! conversion can be turned off.
!
[ markup_vm_keycode_convert _char
	retchar;

	! Default to returning the input character.
	retchar = _char;

#Ifndef MARKUP_NO_GLK_KEY_CONVERSIONS;
	! Pick out return, delete, escape, function keys, and a few other
	! things that it's useful to make seamless across VMs.  7-bit
	! ASCII will also be equivalent across VMs.
	switch (_char) {
	131:	retchar = -2;				! left arrow
	132:	retchar = -3;				! right arrow
	129:	retchar = -4;				! up arrow
	130:	retchar = -5;				! down arrow
	13, 10:	retchar = -6;				! return (or newline)
	8:	retchar = -7;				! delete
	27:	retchar = -8;				! escape
	9:	retchar = -9;				! tab
	133 to 144:					! fkeys
		retchar = 116 - _char;			! -17 to -28
	}
#Endif; ! MARKUP_NO_GLK_KEY_CONVERSIONS

	! Return the converted, or original, character.
	return retchar;
];


!
! markup_vm_tag_wait_timeout()
! markup_vm_tag_wait()
!
! VM-specific handlers for wait tags.  For waitkey, the main wait function
! returns the pressed key, or 0 on timeout.  For waitline, it uses any content
! in linebuf as initial input data, and returns the entered string, or a
! zero length string on timeout.  For wait, the function just waits.  Return
! value is the key on waitkey, ignored on other call types.
!
Global	markup_vm_wait_counter	= 0;
[ markup_vm_tag_wait_timeout;

	! Check the wait counter, and if above zero, decrement.  Return
	! true if reduced to zero; if below zero, always return false.
	if (markup_vm_wait_counter > 0)
		markup_vm_wait_counter--;
	return markup_vm_wait_counter == 0;
];
[ markup_vm_tag_wait delay waitkey waitline linebuf len
	timeout count remaining _char i;

	! We can't delay on the Z-machine; we have to wait for keypresses,
	! so if the VM won't do timed input, reset delay.  And if this is
	! a plain wait of delay zero, there's nothing to do.
	if (50->0 < 1
			|| 1->0 & 128 == 0)
		delay = 0;
	if (delay == 0
			&& (~~(waitkey || waitline)))
		return;

	! The Z-machine works in 1/10 second, but delay is in milliseconds.
	! Convert delay to a timeout and timeout count, making count -1 for
	! safety if delay is zero.
	if (delay > 4000)	{ timeout = 5; count = (delay + 250) / 500; }
	else if (delay > 100)	{ timeout = 1; count = (delay + 50) / 100; }
	else if (delay > 0)	{ timeout = 1; count =  1; }
	else			{ timeout = 0; count = -1; }

	! Implement the waitline function.
	if (waitline) {

		! Linebuf->0 contains the length of any default input.  To
		! reset the buffer for the Z-machine, we actually want ->0
		! to contain the allowable length to read, ->1 the initial
		! data length, which the read overwrites with its return
		! length, and ->2 onwards the initial data.  So we have to
		! shuffle the string out one.  Also, we have to drop one
		! character for a Z-machine newline overrun.
		for (i = linebuf->0 + 1: i >= 1: i--)
			linebuf->i = linebuf->(i - 1);
		linebuf->0 = len - 2;

		! The Z-machine spec says that default input is not output
		! by the @aread, but by the game.  This must cause immense
		! problems for Z-machine interpreters that try to render
		! input in a distinct style; most handle it extremely well.
		if (linebuf->1 > 0)
			markup_vm_put_buffer (linebuf + 2, linebuf->1);

		! Set the timeout counter, and wait for input with timeout.
		markup_vm_wait_counter = count;
		@aread linebuf 0 timeout markup_vm_tag_wait_timeout _char;

		! If the read timed out, reset the return string length to
		! zero and return immediately.
		if (_char == 0) {
			linebuf->0 = 0;
			return;
		}

		! Now move the entire buffer down one so that it's formatted
		! as a string.
		linebuf->0 = linebuf->1;
		for (i = 1: i <= linebuf->0: i++)
			linebuf->i = linebuf->(i + 1);

		! Line read completed.
		return;
	}

	! Implement the waitkey function.
	if (waitkey) {

		! Set the timeout counter, and wait for input with timeout.
		markup_vm_wait_counter = count;
		@read_char 1 timeout markup_vm_tag_wait_timeout _char;

		! If the character read timed out, return zero.  If not,
		! convert special keys to Glk keycodes.  This makes it
		! easier to check for such keys in a VM-neutral way.
		if (_char == 0)
			return 0;
		return markup_vm_keycode_convert (_char);
	}

	! Implement the wait function.  This is a compromise; to try to get
	! the full delay, wait for characters in a loop.
	remaining = count;
	while (remaining > 0) {

		! Wait 1/10 second, or until a key is pressed.
		markup_vm_wait_counter = 1;
		@read_char 1 timeout markup_vm_tag_wait_timeout _char;

		! If not a key press, decrement the remaining timeout,
		! attempting to really delay as long as expected.
		if (_char == 0)
			remaining--;
	}
];

#Endif; ! MARKUP_ENTITIES_ONLY
#Endif; ! TARGET_ZCODE


!----------------------------------------------------------------------------
! Glulx specific routines and tables.
!----------------------------------------------------------------------------
#Ifdef TARGET_GLULX;

Constant	MARKUP_GLULX			true;

!
! markup_vm_to_lower()
! markup_vm_put_char()
! markup_vm_put_buffer()
!
! VM-specific primitives to convert to lowercase, output a character, and
! output a character buffer.
!
[ markup_vm_to_lower _char;

	! Allow Glk to convert for us.  It may be more efficient.
	return glk ($A0, _char);
];
[ markup_vm_put_char _char;

	! Output the character to the currently set Glk stream.
	glk ($80, _char);
];
[ markup_vm_put_buffer buf len;

	! Send the buffer directly to the current Glk stream.
	glk ($84, buf, len);
];


!
! markup_vm_entity()
!
! VM-specific character entity backend.  The code argument is an ISO 8859-1
! character.
!
[ markup_vm_entity code;

	! Decide what character range the character is in.  Based on that,
	! handle a few special cases, and for the rest, check to see if
	! they are printable, and print, or return false if unprintable.
	switch (code) {
			! The Z-machine has OElig and oelig, and we don't.
			! We can fake them here.
	140:		glk ($80, 'O'); glk ($80, 'E');	! OElig
	156:		glk ($80, 'o'); glk ($80, 'e');	! oelig

	 32 to 127,
	160 to 255:	! Check with Glk for printability, and if not doable
			! fail, otherwise print the character.
			if (~~glk ($04, 3, code))	! gestalt_charoutput
				return false;
			glk ($80, code);		! put_character

	default:	! Either not a valid ISO 8859-1 character, or a low
			! (control) value.  Unprintable.
			return false;
	}

	! Character printed successfully.
	return true;
];


#Ifndef MARKUP_ENTITIES_ONLY;

!
! markup_vm_get_window()
!
! Helper VM-specific function to find and return the current output window.
! Returns NULL if none could be determined.
!
[ markup_vm_get_window
	stream win;

	! Get the current set output stream, or return NULL if none.
	stream = glk ($48);				! stream_get_current
	if (stream == 0)
		return 0;

	! Iterate windows, getting the echo stream of each to see if it
	! matches the current output stream.  Notes the matched window,
	! or NULL if no match found.
	win = glk ($20, 0, 0);				! window_iterate
	while (win ~= 0) {
		if (glk ($28, win) == 3 or 4		! text buffer or grid
				&& glk ($2C, win) == stream)
			break;
		win = glk ($20, win, 0);		! window_iterate
	}

	! Return the matched window, or NULL if no match found.
	return win;
];


!
! markup_vm_tag_cls()
!
! VM-specific clear screen tag backend.  Any value passed in as the window
! number is ignored by this function, as Glk can readily find the current
! output window.
!
[ markup_vm_tag_cls win;

	! Get the current output window, fail silently if none apparent.
	win = markup_vm_get_window ();
	if (win == 0)
		return;

	! Clear the window.
	glk ($2A, win);					! window_clear
];


!
! markup_vm_tag_hyperlink()
!
! VM-specific hyperlink backend.  The href argument is the value to attach
! to the hyperlink, 0 to turn off links.
!
[ markup_vm_tag_hyperlink href
	win wintype;

	! Get the current output window, fail silently if none apparent.
	win = markup_vm_get_window ();
	if (win == 0)
		return;

	! Check for general hyperlinking, and hyperlinks for this specific
	! window type.
	wintype = glk ($28, win);			! window_get_type
	if (~~(glk ($04, 11, 0)				! gestalt (general)
			&& glk ($04, 12, wintype)))	! gestalt (specific)
		return;

	! Start (or stop) hyperlinking at this point.
	glk ($100, href);
];


!
! markup_vm_tag_img()
!
! VM-specific image backend.  Pic indicates the picture resource, and may
! not be missing, width and height give the requested dimensions, align is
! the Glk alignment code, and altstr and altlen the alternate string.
!
Array	markup_vm_glkargs	--> 2;
[ markup_vm_tag_img pic width height align altstr altlen
	win wintype;

	! Identify the current output window.  If none identifiable then
	! there's little useful to do, and we'll fail silently.
	win = markup_vm_get_window ();
	if (win == 0)
		return;

	! Verify that the window is capable of inlined graphics.
	wintype = glk ($28, win);			! window_get_type
	if (~~(glk ($04, 6, 0)				! gestalt (general)
			&& glk ($04, 7, wintype))) {	! gestalt (specific)

		! No graphics, so recursively filter any ALT string and
		! we're done.
		if (altlen > 0)
			markup_filter (altstr, altlen);
		return;
	}

	! Query the image resource for dimensions.  If this fails, print
	! any ALT string instead, and return.
	if (~~glk ($E0, pic, markup_vm_glkargs,		! get_image_info
				markup_vm_glkargs + WORDSIZE)) {

		! No resource, so recursively filter any ALT string and
		! we're done.
		if (altlen > 0)
			markup_filter (altstr, altlen);
		return;
	}

	! If alignment is margin, flow break to avoid stairstepping.  Then
	! draw image, scaled if either width or height given.
	if (align == 4 or 5)				! left/right margin
		glk ($E8, win);				! window_flow_break
	if (width ~= 0 || height ~= 0) {

		! Set any missing dimensions from the queried image.
		if (width == 0)
			width = markup_vm_glkargs-->0;
		if (height == 0)
			height = markup_vm_glkargs-->1;

		glk ($E2, win, pic, align, 0, width, height);
							! image_draw_scaled
	}
	else
		glk ($E1, win, pic, align, 0);		! image_draw
];


!
! markup_vm_tag_release()
! markup_vm_tag_serial()
! markup_vm_tag_version()
!
! Print out information about the loaded game and Inform compiler version.
!
Array	markup_release	-> 5;
[ markup_vm_tag_release
	rel i;

	! Get the game release number from the header (bytes 52 and 53),
	rel = 52->0 * 256 + 53->0;

	! Convert release to characters.  We have to avoid print "..."
	! and PrintAnyToArray() as iosys may be redirected by sections.
	i = 4;
	if (rel > 0) {
		for ( : i >= 0 && rel > 0: i--) {
			markup_release->i = rel % 10 + '0';
			rel = rel / 10;
		}
	} else {
		markup_release->i = '0';
		i--;
	}

	! Output the converted release number.
	markup_vm_put_buffer (markup_release + i + 1, 4 - i);
];
[ markup_vm_tag_serial;

	! Print the game's serial number string.  This is found in the
	! six characters at memory offset 54.
	markup_vm_put_buffer (54, 6);
];
[ markup_vm_tag_version;

	! Print the Inform compiler version string.  This is found in the
	! eight characters at memory offset 44.
	markup_vm_put_buffer (44, 4);
	markup_vm_put_char ('('); markup_vm_put_char ('G');
	markup_vm_put_buffer (48, 4); markup_vm_put_char (')');
];


! Table mapping style tag id's to Glk styles.  Entries marked 255 are for
! gaps in tag id numbering, and won't be used.  Style 0 is special -- revert
! to default.
Array	markup_vm_style_table ->
	  0   5   5   1   1   1   1   6   2   2   2   2   2   2   7   7	! HTML
	  3   4 255 255 255 255 255 255 255 255 255 255 255 255 255 255
	  5   7   1   3   8   6   2   4   9  10 255 255 255 255 255 255 ! Glk
	  4   1   1   2   2   2   2 255 255 255 255 255 255 255 255 255;! Z-Mac

!
! markup_vm_style()
!
! VM-specific handler for all style settings.  Code is the tag's id code.
!
[ markup_vm_style code
	_style;

	! Lookup the relevant Glk style for this tag.  If none, ignore the
	! call, otherwise set the style and return.
	_style = markup_vm_style_table->code;
	if (_style == 255)
		return;

	! Set approximately equivalent Glk style.
	glk ($86, _style);				! glk_set_style
];


!
! markup_vm_color()
!
! Stub backend function for unimplemented feature in the Glulx build.
!
[ markup_vm_color color; color = 0;

	! Not implemented.  Nothing to do.
];


!
! markup_vm_tag_wait()
!
! VM-specific handler for wait tags.  For waitkey, the function returns the
! pressed key, or 0 on timeout.  For waitline, the function uses any content
! in linebuf as initial input data, and returns the entered string, or a
! zero length string on timeout.  For wait, the function just waits.  Return
! value is the key on waitkey, ignored on other call types.
!
Array	markup_vm_event	--> 4;
[ markup_vm_tag_wait delay waitkey waitline linebuf len
	win timeout remaining oldremain context res;
	context = 0; res = 0;

	! If waitkey or waitline, get the window, and request a Glk char
	! or line event.  If wait, do nothing if Glk offers no timers or
	! delay is zero.
	if (waitkey || waitline) {

		! Identify the current output window.  If none identifiable
		! then do nothing (fail as if timed out for waitkey).
		win = markup_vm_get_window ();
		if (win == 0)
			return 0;

		if (waitkey)
			glk ($D2, win);			! request_char_event
		if (waitline)
			glk ($D0, win, linebuf + 1, len, linebuf->0);
							! request_line_event
	} else {

		! If plain wait, and delay is zero or Glk doesn't do timers,
		! we're done.
		if (delay == 0
				|| ~~(glk ($04, 5, 0)))	! gestalt_timer
			return;
	}

	! Delay in shorter increments to minimize Glk timer jitter.  We'll
	! aim for ten increments in long delays, fewer in shorter ones, and
	! one if nothing else seems feasible.  If delay is zero, timeout is
	! set to zero, meaning turn off Glk timer events.  If Glk doesn't
	! offer timers, do nothing at all with timer events.
	if ((glk ($04, 5, 0))) {			! gestalt_timer
		if (delay > 1000)	timeout = delay / 10;
		else if (delay > 400)	timeout = delay / 4;
		else if (delay > 100)	timeout = delay / 2;
		else			timeout = delay;
		glk ($D6, timeout);			! request_timer_events
	}

	! Wait for a character or line event, or enough timeouts from Glk
	! to form the delay.  Filter out character or line events from any
	! other windows.
	remaining = delay;
	do {
		glk ($C0, markup_vm_event);		! select
		switch (markup_vm_event-->0) {
		5, 6:					! arrange, redraw
			DrawStatusLine ();
		1:					! timer
			oldremain = remaining;
			if (remaining > timeout)
				remaining = remaining - timeout;
			else
				remaining = 0;
		}

#Ifdef MARKUP_HANDLE_GLK_EVENT;
		! Call entry point.  If return is 2, cancel and complete
		! the wait, if -1, ignore this timeout.
		if (waitline)		context = 4;
		else if (waitkey)	context = 3;
		else			context = 2;
		res = HandleGlkEvent (markup_vm_event, context, remaining);
		if (res == 2)
			break;
		else if (res == -1 && markup_vm_event-->0 == 1)
			remaining = oldremain;		! ignore timeout
#Endif;

	} until ((waitkey && markup_vm_event-->0 == 2	! character event
				&& markup_vm_event-->1 == win)
		|| (waitline && markup_vm_event-->0 == 3! line event
				&& markup_vm_event-->1 == win)
		|| (delay > 0 && remaining == 0));

	! If res is 2 and remaining is zero, assume that HandleGlkEvent()
	! has reset the Glk timeouts to some other value, and don't cancel
	! timers.  Otherwise, cancel timers if Glk supports them.
	if (glk ($04, 5, 0)) { 				! gestalt_timer
		if (~~(res == 2 && remaining == 0))
			glk ($D6, 0);			! cancel timer events
	}

	! For waitkey, cancel any unfilled character request, and return the
	! terminating character.  Glk ignores the cancel if the loop ended
	! on a character event.
	if (waitkey) {
		glk ($D3, win);				! cancel_char_event
		if (markup_vm_event-->0 == 2)		! char event
			return markup_vm_event-->2;
		else
			return 0;
	}

	! For waitline, cancel any unfilled line request, and store the
	! length of any input line in the buffer's first byte.  Glk ignores
	! the cancel if the loop ended on a line event.
	if (waitline) {
		glk ($D1, win, 0);			! cancel_line_event
		if (markup_vm_event-->0 == 3)		! line event
			linebuf->0 = markup_vm_event-->2;
		else
			linebuf->0 = 0;
	}
];

#Endif; ! MARKUP_ENTITIES_ONLY
#Endif; ! TARGET_GLULX


!----------------------------------------------------------------------------
! Routines and tables common to both VMs.
!----------------------------------------------------------------------------

! Global variable used to suppress output for VM-specific text areas.  If
! set greater than zero, suppress all tag handling except for the end tags
! that turn off VM-specific text areas, and also suppress all text output.
Global	markup_suppress		= 0;

! Global tunable exhaustion flags, set whenever one of the tunable limits
! is exceeded.  These flags are checked on exit from a user function, and
! cause an error or warning to be printed if appropriate.
#Ifdef STRICT_MODE;
Global	markup_buffer_exceeded	= false;
Global	markup_nesting_exceeded	= false;
#Endif;


!
! markup_table_search()
!
! Generalized search of an entity, tags, or tag arguments table having
! a given table string length.  Lookup returns the code of the matched
! entry, or 0 if none.  Match is case-sensitive.
!
[ markup_table_search _token _table _index size
	hash offset i j retval;

	! Get the first token character, coerced to lowercase, and check
	! that it's indexable, in effect hashing on the first character.
	! If it's not, or no entries start with this character, return 0.
	hash = markup_vm_to_lower (_token->0);
	if (hash < 'a' || hash > 'z' || _index->(hash - 'a') == 255)
		return 0;

	! Calculate the starting offset into the table.  This is the
	! index entry multiplied by the table element size plus one (for
	! the table's code).
	offset = _index->(hash - 'a') * (size + 1);

	! Scan the table until either the NULL terminator is found, or
	! we come to the end of entries starting with this character.
	! Remember to coerce the character to lowercase in the check...
	j = offset;
	while (_table->j ~= 0
			&& markup_vm_to_lower (_table->(j + 1)) == hash) {

		! Compare strings, terminate if a space matched.
		retval = _table->j++;
		for (i = 0: i < size: i++) {
			if (_table->(j + i) ~= _token->i) {
				retval = 0;
				break;
			}
			if (_token->i == ' ')
				break;
		}

		! Use this entry on full match.
		if (retval ~= 0)
			break;

		! Next table entry.
		j = j + size;
	}

	! Return the table key located, or 0 if none.
	return retval;
];


!
! markup_get_token()
!
! Get the next alphanumeric token, up to a given length, from the input
! string.  Pad the return to length with spaces.  Return the end of token
! index, or -1 if no token available.  Entity name tokens are special --
! they're case-sensitive and may include a leading '#'.
!
[ markup_get_token str len posn _token toklen special
	i j c lc;

	! Tokenize input to a maximum of len alphanumeric characters.
	! For special tokens, the first character may be '#'.
	j = posn; i = 0;
	while (j < len && i < toklen) {

		! Get the next character, and check alphanumeric or '#'.
		c = str->j;
		lc = markup_vm_to_lower (c);
		if (~~((c >= '0' && c <= '9')
				|| (lc >= 'a' && lc <= 'z')
				|| (special && i == 0 && c == '#')))
			break;

		! Add the character to the token, and advance indexes.
		if (special)
			_token->i = c;
		else
			_token->i = lc;
		i++; j++;
	}

	! If no token was generated, or if we ran into the end of the
	! line (the token must end with a non-alphanumeric), return -1.
	if (i == 0 || j == len)
		return -1;

	! Fill out the remainder of the token with spaces, and return the
	! position of the end of token.
	while (i < toklen)
		_token->i++ = ' ';
	return j;
];


! Table mapping character entity names to their ISO 8859-1 codes.  There's
! some wasted space here in padding names to six characters, to make for
! easier and a bit faster table scanning.  As a convenience for characters
! that the Inform compiler makes special, "tilde", "caret", "at" and "backsl"
! are added.
!
! There are also two imposter characters in here, "OElig" and "oelig".  They
! are here because the Z-machine supports them, even though Glulx does not
! (they're not standard ISO 8859-1).  They are placed at 140 and 156, because
! that's their conventional location in non-standard HTML browsers, and these
! are unused codes in ISO 8859-1.  Glk will probably reject them, but they
! do map to ZSCII so the Z-machine will be able to handle them after they've
! been converted through the ZSCII table.
!
! Note that Z-machine does not support all ISO 8859-1 codes, as some are not
! convertible to ZSCII.  And Glulx supports all standard ISO 8859-1 codes,
! but not "OElig" and "oelig".  In other words, Glulx will be able to print
! most, but not all, of this table; Z-machine will be able to print a decent
! sized chunk, though less.  Neither is a subset of the other.
!
! The table is ordered alphabetically by name, with an index built on the
! first letter in the name.  A 255 entry in the index indicates no main table
! entries start with this letter.
Array	markup_entity_table	->
	193	'A''a''c''u''t''e'	225	'a''a''c''u''t''e'
	194	'A''c''i''r''c'' '	226	'a''c''i''r''c'' '
	180	'a''c''u''t''e'' '	198	'A''E''l''i''g'' '
	230	'a''e''l''i''g'' '	192	'A''g''r''a''v''e'
	224	'a''g''r''a''v''e'	 38	'a''m''p'' '' '' '
	197	'A''r''i''n''g'' '	229	'a''r''i''n''g'' '
	 64	'a''t'' '' '' '' '	195	'A''t''i''l''d''e'
	227	'a''t''i''l''d''e'	196	'A''u''m''l'' '' '
	228	'a''u''m''l'' '' '	 92	'b''a''c''k''s''l'
	166	'b''r''k''b''a''r'	166	'b''r''v''b''a''r'
	 94	'c''a''r''e''t'' '	199	'C''c''e''d''i''l'
	231	'c''c''e''d''i''l'	184	'c''e''d''i''l'' '
	162	'c''e''n''t'' '' '	169	'c''o''p''y'' '' '
	164	'c''u''r''r''e''n'	176	'd''e''g'' '' '' '
	168	'd''i''e'' '' '' '	247	'd''i''v''i''d''e'
	208	'D''s''t''r''o''k'	201	'E''a''c''u''t''e'
	233	'e''a''c''u''t''e'	202	'E''c''i''r''c'' '
	234	'e''c''i''r''c'' '	200	'E''g''r''a''v''e'
	232	'e''g''r''a''v''e'	208	'E''T''H'' '' '' '
	240	'e''t''h'' '' '' '	203	'E''u''m''l'' '' '
	235	'e''u''m''l'' '' '	189	'f''r''a''c''1''2'
	188	'f''r''a''c''1''4'	190	'f''r''a''c''3''4'
	 62	'g''t'' '' '' '' '	175	'h''i''b''a''r'' '
	205	'I''a''c''u''t''e'	237	'i''a''c''u''t''e'
	206	'I''c''i''r''c'' '	238	'i''c''i''r''c'' '
	161	'i''e''x''c''l'' '	204	'I''g''r''a''v''e'
	236	'i''g''r''a''v''e'	191	'i''q''u''e''s''t'
	207	'I''u''m''l'' '' '	239	'i''u''m''l'' '' '
	171	'l''a''q''u''o'' '	 60	'l''t'' '' '' '' '
	175	'm''a''c''r'' '' '	181	'm''i''c''r''o'' '
	183	'm''i''d''d''o''t'	160	'n''b''s''p'' '' '
	172	'n''o''t'' '' '' '	209	'N''t''i''l''d''e'
	241	'n''t''i''l''d''e'	211	'O''a''c''u''t''e'
	243	'o''a''c''u''t''e'	212	'O''c''i''r''c'' '
	244	'o''c''i''r''c'' '	140	'O''E''l''i''g'' '
	156	'o''e''l''i''g'' '	210	'O''g''r''a''v''e'
	242	'o''g''r''a''v''e'	170	'o''r''d''f'' '' '
	186	'o''r''d''m'' '' '	216	'O''s''l''a''s''h'
	248	'o''s''l''a''s''h'	213	'O''t''i''l''d''e'
	245	'o''t''i''l''d''e'	214	'O''u''m''l'' '' '
	246	'o''u''m''l'' '' '	182	'p''a''r''a'' '' '
	177	'p''l''u''s''m''n'	163	'p''o''u''n''d'' '
	 34	'q''u''o''t'' '' '	187	'r''a''q''u''o'' '
	174	'r''e''g'' '' '' '	167	's''e''c''t'' '' '
	173	's''h''y'' '' '' '	185	's''u''p''1'' '' '
	178	's''u''p''2'' '' '	179	's''u''p''3'' '' '
	223	's''z''l''i''g'' '	222	'T''H''O''R''N'' '
	254	't''h''o''r''n'' '	126	't''i''l''d''e'' '
	215	't''i''m''e''s'' '	218	'U''a''c''u''t''e'
	250	'u''a''c''u''t''e'	219	'U''c''i''r''c'' '
	251	'u''c''i''r''c'' '	217	'U''g''r''a''v''e'
	249	'u''g''r''a''v''e'	168	'u''m''l'' '' '' '
	220	'U''u''m''l'' '' '	252	'u''u''m''l'' '' '
	221	'Y''a''c''u''t''e'	253	'y''a''c''u''t''e'
	165	'y''e''n'' '' '' '	255	'y''u''m''l'' '' '
	  0;
Array	markup_entity_index	->
	  0  17  20  27  31  41  44  45  46 255 255  56  58
	 61  65  81  84  85  87  93  97 255 255 255 106 255;


!
! markup_entity()
!
! Handle an &...; character entity.  The entity may be either named, for
! example "&quot;", or numeric, "&#34;".  Entity names (and numbers) are
! a maximum of six characters long.  Returns the index of the end of the
! entity, or -1 if invalid.
!
Array	markup_entity_token	-> 6;
[ markup_entity str len start
	_table _index _token posn i code;

	_token = markup_entity_token;
	_table = markup_entity_table;
	_index = markup_entity_index;

	! Tokenize input to a maximum of six characters.  If no ';' seen
	! after six characters, or on reaching the end of the input string,
	! the entity is considered invalid -- output '&' and return.
	posn = markup_get_token (str, len, start, _token, 6, true);
	if (posn == -1 || str->posn ~= ';')
		return -1;

	! See if the token is a numeric entity.
	if (_token->0 == '#') {

		! Convert all digits found after the '#'.  If a non-digit
		! is found, consider invalid.
		code = 0;
		for (i = 1: i < 6: i++) {
			if (_token->i == ' ')
				break;
			if (_token->i < '0' || _token->i > '9')
				return -1;
			code = code * 10 + _token->i - '0';
		}

		! Disallow numeric character codes greater than 255.
		if (code > 255)
			return -1;
	} else {

		! Scan the entity names table for a name match.  Set code to
		! the value for the name matched.  If no name match, fail;
		! unknown entity.
		code = markup_table_search (_token, _table, _index, 6);
		if (code == 0)
			return -1;
	}

	! Call the VM-specific backend function to output the character; if
	! it indicates an unprintable character, fail the entity.
	if (markup_suppress == 0) {
		if (~~markup_vm_entity (code))
			return -1;
	}

	! Return the position of the character after the ';' terminator.
	return posn + 1;
];


#Ifndef MARKUP_ENTITIES_ONLY;

! Short table of tag arguments, ordered by name, and with an index on the
! first letter in the name.  A 255 entry in the index indicates no main
! table entries start with this letter.  Argument id number ranges follow
! main tag id ranges.
Array	markup_argument_table	->
	128	'a''l''i''g''n'' '' '' '	129	'a''l''t'' '' '' '' '' '
	177	'b''g''c''o''l''o''r'' '	177	'b''g''c''o''l''o''u''r'
	176	'c''o''l''o''r'' '' '' '	176	'c''o''l''o''u''r'' '' '
	112	'd''e''l''a''y'' '' '' '	113	'd''e''f''a''u''l''t'' '
	130	'h''e''i''g''h''t'' '' '	144	'h''r''e''f'' '' '' '' '
	113	'i''n''i''t''i''a''l'' '	131	's''r''c'' '' '' '' '' '
	112	't''i''m''e''o''u''t'' '	132	'w''i''d''t''h'' '' '' '
	 99	'w''i''n''d''o''w'' '' '
	  0;
Array	markup_argument_index	->
	  0   2   4   6 255 255 255   8  10 255 255 255 255
	255 255 255 255 255  11  12 255 255  13 255 255 255;


!
! markup_tag_arg()
!
! Handle a MUMBLE= tag argument.  Returns the index of the start of the
! argument, and sets markup_id to the argument id from the table lookup.
!
Array	markup_argument_token	-> 8;
Global	markup_id		=  0;
[ markup_tag_arg str len posn
	_table _index _token next;

	_token = markup_argument_token;
	_table = markup_argument_table;
	_index = markup_argument_index;

	! Skip leading whitespace before the argument.
	next = posn;
	while (next < len && str->next == ' ')
		next++;

	! Tokenize input to a maximum of eight characters, stopping when
	! an '=' is reached.  If none found, return -1; bad parse.
	next = markup_get_token (str, len, next, _token, 8, false);
	if (next == -1 || str->next ~= '=')
		return -1;

	! Scan the arguments table for a name match, and store the code
	! in a global variable.  If there's no name match, this will
	! show zero, indicating a valid looking, but unknown, argument.
	markup_id = markup_table_search (_token, _table, _index, 8);

	! Return the position of the first argument value character; the
	! the character after the '=', plus one if a single quote.
	if (str->(next + 1) == 39)			! single quote
		return next + 2;
	return next + 1;
];


!
! markup_tag_end_arg()
!
! Find the end of MUMBLE= tag argument.
!
[ markup_tag_end_arg str len posn
	j;

	! Search forward for single quote or space terminator.
	if (str->(posn - 1) == 39) {			! single quote
		j = posn;
		while (j < len && str->j ~= 39)		! single quote
			j++;
	} else {
		j = posn;
		while (j < len && (~~(str->j == ' ' or '>')))
			j++;
	}

	! Return -1 if off the end of the string, otherwise end.
	if (j < len)
		return j;
	return -1;
];


!
! markup_tag_numarg()
!
! Return the value of a tag numeric argument.  It's a lax-ish parse, and
! converts just the first string of numerics found, stopping on the first
! non-numeric or at end.
!
[ markup_tag_numarg str arg argend
	retval i;

	! Find the first available digit.
	i = arg;
	while (i < argend && (str->i < '0' || str->i > '9'))
		i++;

	! Pass across the string, converting digits.  Return 0 on wrap.
	retval = 0;
	while (i < argend && str->i >= '0' && str->i <= '9') {
		retval = retval * 10 + str->i - '0';
		if (retval < 0)
			return 0;
		i++;
	}

	! Return the numeric, 0 if no digits found.
	return retval;
];


!
! markup_tag_cls()
!
! Handle the <cls ...> tag.  Ordinarily, it needs no parameter.  However,
! for the Z-machine there isn't any way to either identify the current
! window, or to clear it.  So for this problem case, we add a WINDOW=
! parameter to the tag.  It's ignored totally for Glk, and if absent for
! Z-machine, gets defaulted to 0 which is almost certainly what's wanted.
!
[ markup_tag_cls str len args
	arg argend win;

	! Default argument, for cases where it's absent from the tag.
	win = -1;					! not specified

	! Handle each tag argument.  We'll expect only WINDOW=, and even
	! then, rarely if ever.
	arg = markup_tag_arg (str, len, args);
	while (arg ~= -1) {

		! Get the end of argument index.
		argend = markup_tag_end_arg (str, len, arg);
		if (argend == -1)
			return false;

		! Handle the argument id, and either note or convert the
		! argument text string value.
		switch (markup_id) {
		99:					! WINDOW=
			win = markup_tag_numarg (str, arg, argend);
		}

		! Skip any trailing quote, then find next argument.
		if (str->argend == 39)			! single quote
			argend++;
		arg = markup_tag_arg (str, len, argend);
	}

	! Call the VM-specific backend, and return success status.
	markup_vm_tag_cls (win);
	return true;
];


!
! markup_tag_alignment()
!
! Translate an ALIGN= value into a Glk image alignment.
!
[ markup_tag_alignment str arg argend
	i;

	! Convert discrete values, default to InlineUp if nothing matches.
	i = arg;
	if (argend - i == 6
			&& markup_vm_to_lower (str->i      ) == 'b'
			&& markup_vm_to_lower (str->(i + 1)) == 'o'
			&& markup_vm_to_lower (str->(i + 2)) == 't'
			&& markup_vm_to_lower (str->(i + 3)) == 't'
			&& markup_vm_to_lower (str->(i + 4)) == 'o'
			&& markup_vm_to_lower (str->(i + 5)) == 'm')
		return 1;				! InlineUp
	if (argend - i == 3
			&& markup_vm_to_lower (str->i      ) == 't'
			&& markup_vm_to_lower (str->(i + 1)) == 'o'
			&& markup_vm_to_lower (str->(i + 2)) == 'p')
		return 2;				! InlineDown
	if (argend - i == 6
			&& markup_vm_to_lower (str->i      ) == 'm'
			&& markup_vm_to_lower (str->(i + 1)) == 'i'
			&& markup_vm_to_lower (str->(i + 2)) == 'd'
			&& markup_vm_to_lower (str->(i + 3)) == 'd'
			&& markup_vm_to_lower (str->(i + 4)) == 'l'
			&& markup_vm_to_lower (str->(i + 5)) == 'e')
		return 3;				! InlineCenter
	if (argend - i == 6
			&& markup_vm_to_lower (str->i      ) == 'c'
			&& markup_vm_to_lower (str->(i + 1)) == 'e'
			&& markup_vm_to_lower (str->(i + 2)) == 'n'
			&& markup_vm_to_lower (str->(i + 3)) == 't'
			&& (
				   markup_vm_to_lower (str->(i + 4)) == 'e'
				&& markup_vm_to_lower (str->(i + 5)) == 'r')
			|| (	   markup_vm_to_lower (str->(i + 4)) == 'r'
				&& markup_vm_to_lower (str->(i + 5)) == 'e'))
		return 3;				! InlineCenter
	if (argend - i == 4
			&& markup_vm_to_lower (str->i      ) == 'l'
			&& markup_vm_to_lower (str->(i + 1)) == 'e'
			&& markup_vm_to_lower (str->(i + 2)) == 'f'
			&& markup_vm_to_lower (str->(i + 3)) == 't')
		return 4;				! MarginLeft
	if (argend - i == 5
			&& markup_vm_to_lower (str->i      ) == 'r'
			&& markup_vm_to_lower (str->(i + 1)) == 'i'
			&& markup_vm_to_lower (str->(i + 2)) == 'g'
			&& markup_vm_to_lower (str->(i + 3)) == 'h'
			&& markup_vm_to_lower (str->(i + 4)) == 't')
		return 5;				! MarginRight
	return 1;					! InlineUp
];


!
! markup_tag_img()
!
! Handle the <img ...> tag.  This function returns true on successful tag
! argument parsing, false otherwise.
!
[ markup_tag_img str len args
	arg argend pic width height align alt altend;

	! Default arguments, for cases where they're absent from the tag.
	pic = -1;					! not specified
	width = 0; height = 0;				! not scaling
	align = 1;					! InlineUP
	alt = -1; altend = -1;				! not specified

	! Handle each tag argument.  We'll expect any of SRC=, WIDTH=,
	! HEIGHT=, ALIGN=, and ALT=.  SRC= is the only mandatory one.
	arg = markup_tag_arg (str, len, args);
	while (arg ~= -1) {

		! Get the end of argument index.
		argend = markup_tag_end_arg (str, len, arg);
		if (argend == -1)
			return false;

		! Handle the argument id, and either note or convert the
		! argument text string value.
		switch (markup_id) {
		128:					! ALIGN=
			align = markup_tag_alignment (str, arg, argend);

		129:					! ALT=
			alt = arg; altend = argend;

		130:					! HEIGHT=
			height = markup_tag_numarg (str, arg, argend);

		131:					! SRC=
			pic = markup_tag_numarg (str, arg, argend);

		132:					! WIDTH=
			width = markup_tag_numarg (str, arg, argend);
		}

		! Skip any trailing quote, then find next argument.
		if (str->argend == 39)			! single quote
			argend++;
		arg = markup_tag_arg (str, len, argend);
	}

	! Reject the tag if it didn't contain a valid SRC=.
	if (pic == -1)
		return false;

	! Call the VM-specific backend, and return success status.
	markup_vm_tag_img (pic, width, height, align, str + alt, altend - alt);
	return true;
];


!
! markup_tag_a()
! markup_tag_end_a()
!
! Handle the <a ...>...</a> hyperlink tags.  The first of these functions
! returns true on successful tag argument parsing, false otherwise.
!
[ markup_tag_a str len args
	arg argend href;

	! Default argument, for the case where it's absent from the tag.
	href = -1;					! not specified

	! Handle each tag argument.  We expect only one type, HREF=, and
	! it's mandatory.
	arg = markup_tag_arg (str, len, args);
	while (arg ~= -1) {

		! Get the end of argument index.
		argend = markup_tag_end_arg (str, len, arg);
		if (argend == -1)
			return false;

		! Handle the argument id, and either note or convert the
		! argument text string value.
		switch (markup_id) {
		144:					! HREF=
			href = markup_tag_numarg (str, arg, argend);
		}

		! Skip any trailing quote, then find next argument.
		if (str->argend == 39)			! single quote
			argend++;
		arg = markup_tag_arg (str, len, argend);
	}

	! Reject the tag if it didn't contain a valid HREF=.
	if (href == -1)
		return false;

	! Call the VM-specific backend, and return success status.
	markup_vm_tag_hyperlink (href);
	return true;
];
[ markup_tag_end_a;

	! Call the VM-specific backend.
	markup_vm_tag_hyperlink (0);
];


!
! markup_tag_color()
!
! Translate a [BG]COLOR= value into a Z-machine color code.
!
[ markup_tag_color str arg argend
	i;

	! Convert discrete values, default to 'current' if nothing matches.
	i = arg;
	if (argend - i == 7
			&& markup_vm_to_lower (str->i      ) == 'd'
			&& markup_vm_to_lower (str->(i + 1)) == 'e'
			&& markup_vm_to_lower (str->(i + 2)) == 'f'
			&& markup_vm_to_lower (str->(i + 3)) == 'a'
			&& markup_vm_to_lower (str->(i + 4)) == 'u'
			&& markup_vm_to_lower (str->(i + 5)) == 'l'
			&& markup_vm_to_lower (str->(i + 6)) == 't')
		return 1;				! Default
	if (argend - i == 5
			&& markup_vm_to_lower (str->i      ) == 'b'
			&& markup_vm_to_lower (str->(i + 1)) == 'l'
			&& markup_vm_to_lower (str->(i + 2)) == 'a'
			&& markup_vm_to_lower (str->(i + 3)) == 'c'
			&& markup_vm_to_lower (str->(i + 4)) == 'k')
		return 2;				! Black
	if (argend - i == 3
			&& markup_vm_to_lower (str->i      ) == 'r'
			&& markup_vm_to_lower (str->(i + 1)) == 'e'
			&& markup_vm_to_lower (str->(i + 2)) == 'd')
		return 3;				! Red
	if (argend - i == 5
			&& markup_vm_to_lower (str->i      ) == 'g'
			&& markup_vm_to_lower (str->(i + 1)) == 'r'
			&& markup_vm_to_lower (str->(i + 2)) == 'e'
			&& markup_vm_to_lower (str->(i + 3)) == 'e'
			&& markup_vm_to_lower (str->(i + 4)) == 'n')
		return 4;				! Green
	if (argend - i == 6
			&& markup_vm_to_lower (str->i      ) == 'y'
			&& markup_vm_to_lower (str->(i + 1)) == 'e'
			&& markup_vm_to_lower (str->(i + 2)) == 'l'
			&& markup_vm_to_lower (str->(i + 3)) == 'l'
			&& markup_vm_to_lower (str->(i + 4)) == 'o'
			&& markup_vm_to_lower (str->(i + 5)) == 'w')
		return 5;				! Yellow
	if (argend - i == 4
			&& markup_vm_to_lower (str->i      ) == 'b'
			&& markup_vm_to_lower (str->(i + 1)) == 'l'
			&& markup_vm_to_lower (str->(i + 2)) == 'u'
			&& markup_vm_to_lower (str->(i + 3)) == 'e')
		return 6;				! Blue
	if (argend - i == 7
			&& markup_vm_to_lower (str->i      ) == 'm'
			&& markup_vm_to_lower (str->(i + 1)) == 'a'
			&& markup_vm_to_lower (str->(i + 2)) == 'g'
			&& markup_vm_to_lower (str->(i + 3)) == 'e'
			&& markup_vm_to_lower (str->(i + 4)) == 'n'
			&& markup_vm_to_lower (str->(i + 5)) == 't'
			&& markup_vm_to_lower (str->(i + 6)) == 'a')
		return 7;				! Magenta
	if (argend - i == 4
			&& markup_vm_to_lower (str->i      ) == 'c'
			&& markup_vm_to_lower (str->(i + 1)) == 'y'
			&& markup_vm_to_lower (str->(i + 2)) == 'a'
			&& markup_vm_to_lower (str->(i + 3)) == 'n')
		return 8;				! Cyan
	if (argend - i == 5
			&& markup_vm_to_lower (str->i      ) == 'w'
			&& markup_vm_to_lower (str->(i + 1)) == 'h'
			&& markup_vm_to_lower (str->(i + 2)) == 'i'
			&& markup_vm_to_lower (str->(i + 3)) == 't'
			&& markup_vm_to_lower (str->(i + 4)) == 'e')
		return 9;				! White
	return 0;					! Current
];


!
! markup_tag_font()
!
! Handle the <font ...> color start tag.  The function returns a composite
! value of background * 16 | foreground, or -1 on error.  Note the difference
! between this and other tag handlers' return values.
!
[ markup_tag_font str len args
	arg argend fgcolor bgcolor;

	! Default arguments, for cases where they're absent from the tag.
	fgcolor = 0;					! not specified
	bgcolor = 0;					! not specified

	! Handle each tag argument.  We handle COLOR= and BGCOLOR=.
	arg = markup_tag_arg (str, len, args);
	while (arg ~= -1) {

		! Get the end of argument index.
		argend = markup_tag_end_arg (str, len, arg);
		if (argend == -1)
			return -1;

		! Handle the argument id; convert color from text, and if
		! no conversion, retry for a number.  This allows either
		! COLOR=black or COLOR=2 type arguments.
		switch (markup_id) {
		176:					! COLOR=
			fgcolor = markup_tag_color (str, arg, argend);
			if (fgcolor == 0) {
				fgcolor = markup_tag_numarg (str, arg, argend);
				if (fgcolor > 9) fgcolor = 9;
			}

		177:					! BGCOLOR=
			bgcolor = markup_tag_color (str, arg, argend);
			if (bgcolor == 0) {
				bgcolor = markup_tag_numarg (str, arg, argend);
				if (bgcolor > 9) bgcolor = 9;
			}
		}

		! Skip any trailing quote, then find next argument.
		if (str->argend == 39)			! single quote
			argend++;
		arg = markup_tag_arg (str, len, argend);
	}

	! Compose and return a color value suitable for sending to the
	! VM-specific color setting function.  This has the foreground in
	! the lower halfbyte, and background in the upper halfbyte.
	return (bgcolor * 16) | fgcolor;
];


!
! markup_tag_wait()
!
! Handles the wait and waitkey tags.  For wait, delay for a given number of
! milliseconds, defaulting to a one second delay.  For waitkey, wait until
! key is pressed, or until a timeout, defaulting to no timeout.
!
! markup_waitkey is a user-readable value, indicating the terminating key.
! markup_waitline is a user-readable value, indicating the input line.
!
Global	markup_waitkey	= 0;
Array	markup_waitline	-> 256;
[ markup_tag_wait str len args waitkey waitline
	arg argend delay i j;

	! Default argument, for the case where it's absent from the tag.
	! For waitkey and waitline, default to no timeouts.
	if (waitkey || waitline)
		delay = 0;				! not specified
	else
		delay = 1000;				! not specified
	if (waitline)
		markup_waitline->0 = 0;			! not specified

	! Handle each tag argument.  We expect only DELAY=.
	arg = markup_tag_arg (str, len, args);
	while (arg ~= -1) {

		! Get the end of argument index.
		argend = markup_tag_end_arg (str, len, arg);
		if (argend == -1)
			return false;

		! Handle the argument id, and either note or convert the
		! argument text string value.
		switch (markup_id) {
		112:					! DELAY=
			delay = markup_tag_numarg (str, arg, argend);

		113:					! INITIAL=
			if (waitline) {
				! For waitline, transfer the initial string
				! given into our waitline buffer.  For really
				! arcane reasons, the limit is 253 initial
				! characters.
				for (i = arg, j = 1:
						i < argend && j <= 253:
						i++, j++)
					markup_waitline->j = str->i;
				markup_waitline->0 = j - 1;
			}
		}

		! Skip any trailing quote, then find next argument.
		if (str->argend == 39)			! single quote
			argend++;
		arg = markup_tag_arg (str, len, argend);
	}

	! Call the VM-specific backend, and on waitkey note the return
	! value as the key pressed.  Return success status.
	if (waitkey)
		markup_waitkey = markup_vm_tag_wait (delay, true, false, 0, 0);
	else if (waitline)
		markup_vm_tag_wait (delay, false, true, markup_waitline, 255);
	else
		markup_vm_tag_wait (delay, false, false, 0, 0);
	return true;
];


!
! markup_push_attribute()
! markup_pop_attribute()
!
! Push and pop attribute, used for style tag and font color nesting.  The
! current style or color set is pushed when a new one is set, and popped on
! end of style or font tag.  Functions are passed the stack to manipulate.
! Stacks are a byte array, with entry 0 used as the stack pointer.
!
[ markup_push_attribute stack elements attr;

	! On first call, initialize the stack.  The empty state is for
	! element 0 to be 1; if it's zero, this is the first call after
	! start or restart.
	if (stack->0 == 0)
		stack->0 = 1;

	! If there is space in the stack, add the attribute and return.
	if (stack->0 <= elements) {
		stack->((stack->0)++) = attr;
		return;
	}

#Ifdef STRICT_MODE;
	! Note tunable exhausted.
	markup_nesting_exceeded = true;
#Endif;
];
[ markup_pop_attribute stack;

	! Check for stack underflow, returning either the stacked attribute,
	! or -1 on underflow.  There is no underflow warning.
	if (stack->0 > 1)
		return stack->(--(stack->0));
	return -1;
];


! Table of HTML-like markup tags.  As with entities, there's some wasted
! space here in padding names.  Tags are grouped: 1-31 are HTML styles,
! 32-47 Glk styles, 48-63 Z-machine styles, 96-111 layouts, 112-127 waits,
! 128 image, 144 anchor, 160-175 info, 176-191 font and direct colors, and
! 255 markup reset.  As with entity names, tags are sorted by name, and
! indexed on their first character.  Tag 0 is reserved, unused in the table.
Array	markup_tag_table	->
	144	'a'' '' '' '' '' '' '' '' '' '' '' '	! anchor
	  6	'a''d''d''r''e''s''s'' '' '' '' '' '	! HTML style
	 32	'a''l''e''r''t'' '' '' '' '' '' '' '	! direct Glk style
	  1	'b'' '' '' '' '' '' '' '' '' '' '' '	! HTML style
	177	'b''l''a''c''k'' '' '' '' '' '' '' '	! direct Z-machine color
	 33	'b''l''o''c''k''q''u''o''t''e'' '' '	! direct Glk style
	181	'b''l''u''e'' '' '' '' '' '' '' '' '	! direct Z-machine color
	 48	'b''o''l''d'' '' '' '' '' '' '' '' '	! direct Z-machine style
	 96	'b''r'' '' '' '' '' '' '' '' '' '' '	! layout
	 15	'c''i''t''e'' '' '' '' '' '' '' '' '	! HTML style
	 99	'c''l''e''a''r'' '' '' '' '' '' '' '	! cls synonym
	 99	'c''l''s'' '' '' '' '' '' '' '' '' '	! Adrift-like clear
	 10	'c''o''d''e'' '' '' '' '' '' '' '' '	! HTML style
	183	'c''y''a''n'' '' '' '' '' '' '' '' '	! direct Z-machine color
	  5	'd''f''n'' '' '' '' '' '' '' '' '' '	! HTML style
	  4	'e''m'' '' '' '' '' '' '' '' '' '' '	! HTML style
	 34	'e''m''p''h''a''s''i''z''e''d'' '' '	! direct Glk style
	176	'f''o''n''t'' '' '' '' '' '' '' '' '	! Z-machine colors
	179	'g''r''e''e''n'' '' '' '' '' '' '' '	! direct Z-machine color
	100	'g''l''u''l''x'' '' '' '' '' '' '' '	! Glulx only
	 16	'h''1'' '' '' '' '' '' '' '' '' '' '	! HTML style
	 17	'h''2'' '' '' '' '' '' '' '' '' '' '	! HTML style
	 35	'h''e''a''d''e''r'' '' '' '' '' '' '	! direct Glk style
	  3	'i'' '' '' '' '' '' '' '' '' '' '' '	! HTML style
	128	'i''m''g'' '' '' '' '' '' '' '' '' '	! image
	 36	'i''n''p''u''t'' '' '' '' '' '' '' '	! direct Glk style
	 11	'k''b''d'' '' '' '' '' '' '' '' '' '	! HTML style
	182	'm''a''g''e''n''t''a'' '' '' '' '' '	! direct Z-machine color
	255	'm''a''r''k''u''p'' '' '' '' '' '' '	! markup reset tag
	 37	'n''o''t''e'' '' '' '' '' '' '' '' '	! direct Glk style
	 97	'p'' '' '' '' '' '' '' '' '' '' '' '	! layout
	  9	'p''r''e'' '' '' '' '' '' '' '' '' '	! HTML style
	 38	'p''r''e''f''o''r''m''a''t''t''e''d'	! direct Glk style
	 98	'q'' '' '' '' '' '' '' '' '' '' '' '	! TADS-like quote
	 14	'q''u''o''t''e'' '' '' '' '' '' '' '	! HTML style
	114	'r''e''a''d''l''i''n''e'' '' '' '' '	! waitline synonym
	178	'r''e''d'' '' '' '' '' '' '' '' '' '	! direct Z-machine color
	160	'r''e''l''e''a''s''e'' '' '' '' '' '	! game's release
	 49	'r''e''v''e''r''s''e'' '' '' '' '' '	! direct Z-machine style
	 13	's''a''m''p'' '' '' '' '' '' '' '' '	! HTML style
	161	's''e''r''i''a''l'' '' '' '' '' '' '	! game's serial number
	  2	's''t''r''o''n''g'' '' '' '' '' '' '	! HTML style
	 39	's''u''b''h''e''a''d''e''r'' '' '' '	! direct Glk style
	  8	't''t'' '' '' '' '' '' '' '' '' '' '	! HTML style
	  7	'u'' '' '' '' '' '' '' '' '' '' '' '	! HTML style
	 50	'u''n''d''e''r''l''i''n''e'' '' '' '	! direct Z-machine style
	 40	'u''s''e''r''1'' '' '' '' '' '' '' '	! direct Glk style
	 41	'u''s''e''r''2'' '' '' '' '' '' '' '	! direct Glk style
	 12	'v''a''r'' '' '' '' '' '' '' '' '' '	! HTML style
	162	'v''e''r''s''i''o''n'' '' '' '' '' '	! Inform version
	112	'w''a''i''t'' '' '' '' '' '' '' '' '	! Adrift-like wait
	113	'w''a''i''t''k''e''y'' '' '' '' '' '	! Adrift-like waitkey
	114	'w''a''i''t''l''i''n''e'' '' '' '' '	! nothing-like waitline
	184	'w''h''i''t''e'' '' '' '' '' '' '' '	! direct Z-machine color
	 51	'x''b''o''l''d'' '' '' '' '' '' '' '	! Z-machine combo style
	 52	'x''r''e''v''e''r''s''e'' '' '' '' '	! Z-machine combo style
	 53	'x''r''o''m''a''n'' '' '' '' '' '' '	! Z-machine combo style
	 54	'x''u''n''d''e''r''l''i''n''e'' '' '	! Z-machine combo style
	180	'y''e''l''l''o''w'' '' '' '' '' '' '	! direct Z-machine color
	101	'z''c''o''d''e'' '' '' '' '' '' '' '	! Z-machine only
	  0;
Array	markup_tag_index	->
	  0   3   9  14  15  17  18  20  23 255  26 255  27
	 29 255  30  33  35  39  43  44  48  50  54  58  59;


!
! markup_tag()
!
! Handle a <...> markup tag.  Tag names are a maximum of twelve characters
! long.  Returns the position after the end of the tag, -1 on parse error.
!
! The function maintains the current style and color, and a stack of prior
! styles and colors.  Style 0 is special, indicating default text style.
! Color $11 is the initial foreground * 16 + initial background encoded in
! the way returned by the font tag handler, and expected by the VM-specific
! color handler.
!
Array	markup_style_stack	-> MARKUP_ATTRIBUTE_NESTING + 1;
Global	markup_current_style	= 0;			! normal style
Array	markup_color_stack	-> MARKUP_ATTRIBUTE_NESTING + 1;
Global	markup_current_color	= $11;			! default colors
Array	markup_tag_token	-> 12;
Global	markup_quote_nesting	= 0;			! quote nesting
[ markup_tag str len start
	_token _table _index posn endtag final code _style color quote;

	_token = markup_tag_token;
	_table = markup_tag_table;
	_index = markup_tag_index;

	! Handle the comment tag specially; it can't use the table or
	! pass into the tokenizer function.
	posn = start;
	if (len - posn >= 4
			&& str->posn       == '!'
			&& str->(posn + 1) == '-'
			&& str->(posn + 2) == '-'
			&& str->(posn + 3) == ' ') {

		! Locate the end of the comment tag.  Return the index
		! of the character after it, or len if none.
		while (posn < len && str->posn ~= '>')
			posn++;
		if (posn == len)
			return posn;
		return posn + 1;
	}

	! If the first tag character is a '/', set a flag and advance.
	if (posn < len && str->posn == '/') {
		endtag = true;
		posn++;
	} else
		endtag = false;

	! Tokenize input to a maximum of twelve characters.  If no '>' or
	! space seen after twelve characters, or on reaching the end of the
	! input string, the tag is considered invalid.
	posn = markup_get_token (str, len, posn, _token, 12, false);
	if (posn == -1 || (~~(str->posn == '>' or ' ')))
		return -1;

	! Advance to the position of the tag's terminator.  Finding the
	! tag terminator means traversing sections of single quotes, if
	! any are encountered.  If no terminating '>' found, reject it.
	final = posn; quote = false;
	while (final < len) {
		if ((~~quote) && str->final == '>')
			break;
		if (str->final == 39)			! single quote
			quote = ~~quote;
		final++;
	}
	if (final == len)
		return -1;

	! Scan the tags table for a name match.
	code = markup_table_search (_token, _table, _index, 12);

	! If suppressing in a VM-specific text area, ignore all tags
	! except VM-specific ones or markup reset.
	if (markup_suppress > 0
			&& code ~= 100 or 101 or 255)
		return final + 1;

	! Handle the tag id returned.  If no tag match, return -1.
	if (endtag) {
		switch (code) {
		  0:	return -1;			! No tag match.

		  1 to 63:				! Style change end tags.
			_style = markup_pop_attribute (markup_style_stack);
			if (_style ~= -1) {
				markup_current_style = _style;
				markup_vm_style (markup_current_style);
			}

		 98:					! End quotes.
			if (markup_quote_nesting > 0) {
				if (--markup_quote_nesting & 1)
		 			markup_vm_put_char (39);
				else
		 			markup_vm_put_char ('"');
			}

		100:					! End Glulx section.
			if ((~~MARKUP_GLULX)
					&& markup_suppress > 0)
				markup_suppress--;
		101:					! End Z-machine section.
			if (MARKUP_GLULX
					&& markup_suppress > 0)
				markup_suppress--;

		144:	markup_tag_end_a ();		! Anchor end tag.

		176 to 184:				! Font/color end tag.
			color = markup_pop_attribute (markup_color_stack);
			if (color ~= -1) {
				markup_current_color = color;
				markup_vm_color (markup_current_color);
			}

		255:					! Markup reset
			markup_style_stack->0 = 1;	! reset styles
			markup_current_style = 0;
			markup_vm_style (markup_current_style);

			markup_color_stack->0 = 1;	! reset colors
			markup_current_color = $11;
			markup_vm_color (markup_current_color);

			markup_suppress = 0;		! cancel suppression
			markup_quote_nesting = 0;	! cancel quotes

			markup_tag_end_a ();		! cancel any hyperlink
		}
	} else {
		switch (code) {
		  0:	return -1;			! No tag match.

		  1 to 63:				! Style change tags.
			markup_push_attribute (markup_style_stack,
						MARKUP_ATTRIBUTE_NESTING,
						markup_current_style);
			markup_current_style = code;
			markup_vm_style (markup_current_style);

		 96:	markup_vm_put_char (10);	! NL
		 97:	markup_vm_put_char (10);	! NL, NL (blank line)
			markup_vm_put_char (10);
		 98:					! Start quotes.
			if (markup_quote_nesting++ & 1)
		 		markup_vm_put_char (39);
			else
		 		markup_vm_put_char ('"');

		 99:					! Clear main window.
			if (~~markup_tag_cls (str, len, posn))
				return -1;

		100:					! Glulx only.
			if (~~MARKUP_GLULX)
				markup_suppress++;
		101:					! Z-machine only.
			if (MARKUP_GLULX)
				markup_suppress++;

		112:					! Wait tag.
			if (~~markup_tag_wait (str, len, posn, false, false))
				return -1;

		113:					! Waitkey tag.
			if (~~markup_tag_wait (str, len, posn, true, false))
				return -1;

		114:					! Waitline tag.
			if (~~markup_tag_wait (str, len, posn, false, true))
				return -1;

		128:					! Image tag.
			if (~~markup_tag_img (str, len, posn))
				return -1;

		144:					! Anchor start tag.
			if (~~markup_tag_a (str, len, posn))
				return -1;

		160:	markup_vm_tag_release ();	! Release.
		161:	markup_vm_tag_serial ();	! Serial number.
		162:	markup_vm_tag_version ();	! Inform version.

		176 to 184:				! Font/color tag.
			switch (code) {
			176:				! Font tag.
				color = markup_tag_font (str, len, posn);
				if (color == -1)
					return -1;
			default:			! Direct colors.
				color = code - 175;	! 2-9 = black-white
			}
			markup_push_attribute (markup_color_stack,
						MARKUP_ATTRIBUTE_NESTING,
						markup_current_color);
			markup_current_color = color;
			markup_vm_color (markup_current_color);
		}
	}

	! Return the next character to handle.
	return final + 1;
];

#Endif; ! MARKUP_ENTITIES_ONLY


!
! markup_filter()
!
! Filter an input string of ASCII characters, of the given length, for
! entities and tags.  The input must be ASCII.
!
[ markup_filter str len
	posn marker next;

	! Search for markup indicators.  If an entity or a tag introducer
	! is found, call the appropriate handler.  Otherwise, output the
	! characters verbatim.
	marker = 0; posn = 0;
	while (posn < len) {
		if (str->posn == '&' or '<') {

			! Flush pending output, then handle the markup
			! introducer detected.
			if (marker < posn
					&& markup_suppress == 0)
				markup_vm_put_buffer (str + marker,
							posn - marker);
			switch (str->posn) {
			'&':	next = markup_entity (str, len, posn + 1);
#Ifndef MARKUP_ENTITIES_ONLY;
			'<':	next = markup_tag (str, len, posn + 1);
#Ifnot;
			'<':	next = -1;		! emulates tag fail
#Endif; ! MARKUP_ENTITIES_ONLY
			}

			! If the tag or entity was valid, advance posn to
			! the index returned, move on the marker, and
			! loop.  If not, just advance the marker, as we
			! flushed above.
			if (next > posn) {
				posn = next;
				marker = posn;
				continue;
			} else
				marker = posn;
		}

		! Nothing special, so just advance posn one more character.
		posn++;
	}

	! Flush any and all remaining pending output.
	if (marker < len
			&& markup_suppress == 0)
		markup_vm_put_buffer (str + marker, len - marker);
];


!----------------------------------------------------------------------------
! Z-machine specific user entry points.
!----------------------------------------------------------------------------
#Ifdef TARGET_ZCODE;

!
! markup()
!
! Filter and print an input string.  The reference passed in must be a
! string.  The string data must be no longer than allowed for in the buffer.
! Characters beyond this limit will cause problems, as there is no way to
! tell the Z-machine the size of the buffer connected to output stream 3.
!
! The buffer definition of 'buffer_', with a global reference 'buffer' to
! it is deliberate, and is a trick to allow us to refer to the buffer with
! both -> and --> without raising a compiler warning in Inform 6.3.
! Defining the buffer as a 'Buffer' type in 6.3 prevents the warning, but
! we do things this way for backwards compatibility with pre-6.3 compilers.
!
! This function is the main user entry point to HTML-like markup.
!
Array	markup_vm_buffer_	-> MARKUP_BUFFER_SIZE + WORDSIZE;
Global	markup_vm_buffer	= markup_vm_buffer_;
Global	markup_vm_started	= false;
[ markup reference a1 a2 a3 a4 a5 a6			! varargs
	len;

	! Switch the Z-machine output stream to the markup buffer.  Unless
	! in a section, that is.  For that case, we can treat this call
	! as an ordinary print.  Characters are already being buffered into
	! the markup buffer by output stream redirection; on section end
	! we'll deal with them.
	if (~~markup_vm_started)
		@output_stream 3 markup_vm_buffer;

	! Print the reference handed in based on its metaclass.  Print a
	! string, call a function, print an object name, and do nothing
	! for a class.
	switch (metaclass (reference)) {
	String:		print (string) reference;	! print string
	Routine:	reference (a1, a2, a3, a4, a5, a6);
							! call function
	Object:		print (name) reference;		! print obj name
	}

	! If we didn't redirect the output stream above, because we're in
	! a section, return now, and thus behave like print.  Otherwise,
	! redirect it back and continue.  All clear?
	if (markup_vm_started)
		return;
	@output_stream -3;

	! The count of characters buffered is in the first word of the
	! markup buffer.  Filter this many characters from the remainder.
	! Also, try to warn about overflow, though it may be too late.
	len = markup_vm_buffer-->0;
	if (len > MARKUP_BUFFER_SIZE) {
		len = MARKUP_BUFFER_SIZE;
#Ifdef STRICT_MODE;
		markup_buffer_exceeded = true;
#Endif;
	}
	markup_filter (markup_vm_buffer + WORDSIZE, len);

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


!
! markup_printfilter()
!
! Filter an input string of ASCII characters, of the given length, for
! entities and tags.  The input must be ASCII.
!
! This function is a secondary user entry point to HTML-like markup.
!
[ markup_printfilter str len;

	! Filter the input string.
	markup_filter (str, len);

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


!
! markup_start()
! markup_end()
!
! Called by the user to indicate the start and end points of a markup
! section.  Within a section,  print "..." output accumulates in the markup
! buffer.  Unlike Glulx, there's no real way to monitor characters and try
! a preemptive flush when we see something that looks like the end of a
! tag or entity, so all we can do here is filter on section end.
!
! These functions are secondary user entry points to HTML-like markup.
!
[ markup_start;

	! Redirect Z-machine output to markup buffering.  Because the
	! Z-machine offers no way to tell if the output stream is redir-
	! ected, we need to set and maintain a flag.
 	if (~~markup_vm_started) {
		@output_stream 3 markup_vm_buffer;
		markup_vm_started = true;
	}
];
[ markup_end
	len;

 	! If not actually in a markup section, ignore the call.
 	if (~~markup_vm_started)
 		return;

	! Redirect Z-machine output back to whence it came, and flush any
	! buffered output.  Clear the markup section flag.
	@output_stream -3;
	len = markup_vm_buffer-->0;
	if (len > MARKUP_BUFFER_SIZE) {
		len = MARKUP_BUFFER_SIZE;
#Ifdef STRICT_MODE;
		markup_buffer_exceeded = true;
#Endif;
	}
	markup_filter (markup_vm_buffer + WORDSIZE, len);
	markup_vm_buffer-->0 = 0;
	markup_vm_started = false;

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


#Ifdef STRICT_MODE;
!
! markup_vm_notify
!
! Notify the user of any tunable exhaustion, if this is a valid point to
! do so.  This function checks for sections, and if not in one, reports
! and then clears exhaustion flags.
!
[ markup_vm_notify;

	! Don't attempt this if inside a markup section.
	if (markup_vm_started)
		return;

	! Report and clear flagged exhaustions.
	if (markup_buffer_exceeded) {
		font on; style bold;
		print "^^[ MARKUP ERROR: Output buffer overflow. This is a
			dangerous condition -- internal memory is probably
			corrupted. Try printing less, or increasing
			MARKUP_BUFFER_SIZE, currently set to ",
			MARKUP_BUFFER_SIZE, ". ]^^";
		font on; style roman;
		markup_buffer_exceeded = false;
	}
	if (markup_nesting_exceeded) {
		font on; style bold;
		print "^^[ MARKUP ERROR: Attribute stack overflow. Check tag
			nesting, or try increasing
			MARKUP_ATTRIBUTE_NESTING, currently set to ",
			MARKUP_ATTRIBUTE_NESTING, ". ]^^";
		markup_nesting_exceeded = false;
		font on; style roman;
	}
];
#Endif; ! STRICT_MODE
#Endif; ! TARGET_ZCODE


!----------------------------------------------------------------------------
! Glulx specific user entry points.
!----------------------------------------------------------------------------
#Ifdef TARGET_GLULX;

!
! markup()
!
! Filter and print an input string.  The string may be a "string", a C-style
! (NUL-terminated) array, or anything that PrintAnyToArray can handle.  The
! string data must be no longer than allowed for in the buffer.  Characters
! beyond this limit are silently truncated.
!
! This function is the main user entry point to HTML-like markup.
!
Array	markup_vm_buffer	-> MARKUP_BUFFER_SIZE;
[ markup _vararg_count					! varargs
	mode rock buflen len;

	! If we're inside a markup section, we shouldn't really have been
	! called.  To recover from this, we can just behave like print.
	! The downstream markup_iosys() will handle markup on our behalf.
	! Accomplish this by tailcalling PrintAnything(), which in effect
	! transforms the call to markup() into a call to PrintAnything().
	! The tailcall never returns.
	@getiosys mode rock;
	if (mode == 1 && rock == markup_vm_iosys)
		@tailcall PrintAnything _vararg_count;

	! Push the address and length of the markup buffer on top of the
	! current varargs stack.
	buflen = MARKUP_BUFFER_SIZE;
	@copy buflen sp;		_vararg_count++;
	@copy markup_vm_buffer sp;	_vararg_count++;

	! Convert whatever we were handed to ASCII, and then filter it.
	! PrintAnyToArray() takes strings, C-style arrays, objects,
	! functions, and so on, and will convert whatever was on our
	! stack before we added the buffer address and length.  Because
	! it returns the length of output without taking truncation into
	! account, we have to.
	@call PrintAnyToArray _vararg_count len;
	if (len > buflen) {
		len = buflen;
#Ifdef STRICT_MODE;
		markup_buffer_exceeded = true;
#Endif;
	}
	markup_filter (markup_vm_buffer, len);

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


!
! markup_printfilter()
!
! Filter an input string of ASCII characters, of the given length, for
! entities and tags.  The input must be ASCII.
!
! This function is a secondary user entry point to HTML-like markup.
!
[ markup_printfilter str len;

	! Filter the input string.
	markup_filter (str, len);

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


!
! markup_vm_iosys()
!
! Buffering function to connect to Glulx iosys in markup sections.  The
! function will automatically flush its buffer through the filter if it
! fills, or if the incoming character is either '>' (an end of tag), a
! ';' (a possible end of character entity), or a newline.
!
Global	markup_vm_length	= 0;
[ markup_vm_iosys c;

	! Add the character to the buffer.
	markup_vm_buffer->markup_vm_length++ = c;
#Ifdef STRICT_MODE;
	if (markup_vm_length == MARKUP_BUFFER_SIZE)
		markup_buffer_exceeded = true;
#Endif;

	! If full, or if the character looks like we've just received an
	! HTML tag or entity, or if at the end of a line, flush the buffer.
	! We flush on probable end of tags or entities to avoid letting the
	! buffer get over-full, at which point we'd risk flushing mid-tag
	! or mid-entity, and so missing it.
	if (c == '>' or ';' or 10
			|| markup_vm_length == MARKUP_BUFFER_SIZE) {
		markup_filter (markup_vm_buffer, markup_vm_length);
		markup_vm_length = 0;
	}
];


!
! markup_start()
! markup_end()
!
! Called by the user to indicate the start and end points of a markup
! section.  Within a section, all print "..." output is rerouted through
! Glulx iosys to markup_iosys, and so printed strings are automatically
! filtered without the need to call markup explicitly.  As a bonus, tags
! can span multiple print calls with this scheme.
!
! These functions are secondary user entry points to HTML-like markup.
!
Global	markup_vm_saved_mode	= 2;		! Glk
Global	markup_vm_saved_rock	= 0;
[ markup_start
 	mode rock;

	! Redirect Glulx iosys to markup buffering.
 	@getiosys mode rock;
 	if (~~(mode == 1 && rock == markup_vm_iosys)) {
		@getiosys markup_vm_saved_mode markup_vm_saved_rock;
		@setiosys 1 markup_vm_iosys;
	}
];
[ markup_end
 	mode rock;
 
 	! If not actually in a markup section, ignore the call.
 	@getiosys mode rock;
 	if (~~(mode == 1 && rock == markup_vm_iosys))
 		return;

	! Redirect Glulx iosys back to Glk, and flush any buffered output.
	@setiosys markup_vm_saved_mode markup_vm_saved_rock;
	markup_filter (markup_vm_buffer, markup_vm_length);
	markup_vm_length = 0;

#Ifdef STRICT_MODE;
	! Consider reporting any errors.
	markup_vm_notify ();
#Endif;
];


#Ifdef STRICT_MODE;
!
! markup_vm_notify
!
! Notify the user of any tunable exhaustion, if this is a valid point to
! do so.  This function checks for sections, and if not in one, reports
! and then clears exhaustion flags.
!
[ markup_vm_notify
	mode rock;

	! Don't attempt this if inside a markup section.
 	@getiosys mode rock;
 	if (mode == 1 && rock == markup_vm_iosys)
		return;

	! Report and clear flagged exhaustions.
	if (markup_buffer_exceeded) {
		glk ($86, 5);				! style_Alert
		print "^^[ MARKUP ERROR: Output buffer overflow. Markup
			output has been truncated, and text lost.
			Try printing less, or increasing
			MARKUP_BUFFER_SIZE, currently set to ",
			MARKUP_BUFFER_SIZE, ". ]^^";
		glk ($86, 0);				! style_Normal
		markup_buffer_exceeded = false;
	}
	if (markup_nesting_exceeded) {
		glk ($86, 5);				! style_Alert
		print "^^[ MARKUP ERROR: Attribute stack overflow. Check tag
			nesting, or try increasing
			MARKUP_ATTRIBUTE_NESTING, currently set to ",
			MARKUP_ATTRIBUTE_NESTING, ". ]^^";
		glk ($86, 0);				! style_Normal
		markup_nesting_exceeded = false;
	}
];
#Endif; ! STRICT_MODE
#Endif; ! TARGET_GLULX

#Endif; ! MARKUP_H
