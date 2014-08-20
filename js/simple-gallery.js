/*
 * Simple Gallery - jQuery Plugin
 * Simple gallery supporting variable elements/images widths.
 *
 * Copyright (c) 2014 Olga Yuzich 
 *
 * Version: 0.1 (20/8/2014)
 * Requires: jQuery v1.4+
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */
(function( $ ){

	var _css = {};

	var methods = {
		//
		// Initialzie plugin
		//
		init : function(options){

			var options = $.extend({}, $.fn.simpleGallery.defaults, options);
            //в нашем случае this это  $( '.set' )
			return this.each(function(){

				var $slider = $( this ),

				    data = $slider.data( 'slider' );
                //Если нет обработчиков повешанных на этот элемент
				if ( ! data ){
                    //находим контейнер, элементы управления, прокручиваемое содержимое
					var $sliderContainer = $slider.find(options.slider),
					    $sliderControls = $slider.next().filter('.controls'),
					    $items = $sliderContainer.find( options.items ),
					    originalWidth = 1;
                    //суммируем ширину каждого li с учетом отступов и тп
					$items.each(function(){ originalWidth += $(this).outerWidth(true) });
                    //выставляем соответственную ширину контейнера.
					$sliderContainer.width( originalWidth );

					// бесконечная прокрутка, увеличиваем ширину в три раза
					if ( options.infinite ){
						$slider.attr('data-slider-infinite',true)

						originalWidth = originalWidth * 3;
						$sliderContainer.width( originalWidth );
                    // клонируем элементы, и проставляем им класс berfore, тем что перед стоят, after тем что после
						$items.clone().addClass( '-after' ).insertAfter( $items.filter(':last') );
						$items.filter( ':first' ).before( $items.clone().addClass('-before') );
                    // Учитываем их
					    $items = $sliderContainer.find( options.items );
                        // берем первый элемент без класса, добавляем для него класс и прокручиваем до него
                        var first = $items.filter( ':not(.-before):not(.-after):first' ).addClass( 'active' );
                        $slider.scrollLeft(first.position().left);
					}
                    // при нажатии на ссылку выводим картинку в блоке .img
                    if(options.gallery){
                        $items.find('a').click(
                            function() {
                                var href = $(this).attr('href');
                                $slider.prev('.img').find('img').attr('src',href);
                                return false;
                            }
                        );
                    }
					$slider.items = $items;
					$slider.options = options;

					// attach events
					$slider.bind( 'nextSlide', function( e, t ){

                        //насколько прокручен элемент скроллом
						var scroll = $slider.scrollLeft();
						var x = 0;
						var slide = 0;

						$items.each(function( i ){
                        //смотрим положение элемента в контейнере запоминаем
							if ( x == 0 && $( this ).position().left > 1 ){
								x = $( this ).position().left;
								slide = i;
							}
						});
                        //смотрим положение элемента в контейнере запоминаем
						if ( x > 0 && $sliderContainer.outerWidth() - scroll - $slider.width() - 1 > 0 ){
							slideTo( e, $slider, scroll+x, slide, 'fast' );
						} else if ( options.loop ){
							// return to first
							slideTo( e, $slider, 0, 0, 'slow' );
						}

					});
					$slider.bind( 'prevSlide', function( e, t ){

						var scroll = $slider.scrollLeft();
						var x = 0;
						var slide = 0;

						$items.each(function( i ){
							if ( $( this ).position().left < 0 ){
								x = $( this ).position().left;
								slide = i;
							}
						});

						if ( x ){
							slideTo( e, $slider, scroll+x, slide, 'fast' )
						} else if ( options.loop ){
							// return to last
							var a = $sliderContainer.outerWidth() - $slider.width();
							var b = $items.filter( ':last' ).position().left;
							slide = $items.size() - 1;
							if ( a > b ){
								slideTo( e, $slider, b, slide, 'fast' );
							} else {
								slideTo( e, $slider, a, slide, 'fast' );
							}
						}

					});
					$slider.bind( 'slideTo', function( e, i, t ){

						slideTo(
							e, $slider,
							$slider.scrollLeft() + $items.filter( ':eq(' + i +')' ).position().left,
							i, t );

					});

					// controls
					$sliderControls.find( '.next-slide' ).click(function(){
						$slider.trigger( 'nextSlide' );
						return false;
					});
					$sliderControls.find( '.prev-slide' ).click(function(){
						$slider.trigger( 'prevSlide' );
						return false;
					});

					$slider.data( 'slider', {
						'target'  : $slider,
						'options' : options
					})

				}

			});

		},
		//
		// Destroy plugin
		//
		destroy : function(){

			return this.each(function(){

				var $slider = $( this ),
				    $sliderControls = $slider.next().filter( '.controls' ),
				    $items = $slider.find('> *:first > *'),
				    data = $slider.data( 'slider' );

				$slider.unbind( 'nextSlide' );
				$slider.unbind( 'prevSlide' );
				$slider.unbind( 'slideTo' );

				$sliderControls.find( '.next-slide' ).unbind( 'click' );
				$sliderControls.find( '.prev-slide' ).unbind( 'click' );

				$slider.removeData( 'slider' );

				if ($slider.attr('data-slider-infinite')) {
            $.merge($items.filter('.-before'),$items.filter('.-after')).each(function(index,item){
                $(item).remove();
            });
        }
			});

		}
	}
	// Private functions
	function slideTo( e, $slider, x, i, t ){

		$slider.items.filter( 'li:eq(' + i + ')' ).addClass( 'active' ).siblings( '.active' ).removeClass( 'active' );

		if ( typeof t == 'undefined' ){
			t = 'fast';
		}
		if ( t ){
			$slider.animate({ 'scrollLeft' : x }, t, function(){
				checkInfinite( $slider );
			});
		} else {
			var time = 0;
			$slider.scrollLeft( x );
			checkInfinite( $slider );
		}

	}
	function checkInfinite( $slider ){

		var $active = $slider.items.filter( '.active' );
		if ( $active.hasClass( '-before' ) ){

			var i = $active.prevAll().size();
			$active.removeClass( 'active' );
			$active = $slider.items.filter( ':not(.-before):eq(' + i + ')' ).addClass( 'active' );
			$slider.scrollLeft( $slider.scrollLeft() + $active.position().left );

		} else if ( $active.hasClass( '-after' ) ){

			var i = $active.prevAll( '.-after' ).size();
			$active.removeClass( 'active' );
			$active = $slider.items.filter( ':not(.-before):eq(' + i + ')' ).addClass( 'active' );
			$slider.scrollLeft( $slider.scrollLeft() + $active.position().left );

		}

	}
	//
	// Debug
	//
	function debug( text ){
		$( '#debug span' ).text( text );
	}


	$.fn.simpleGallery = function( method , options ){
		if (options == null) { options = {}; };
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || !method ){
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.simpleGallery' );
		}

	};



	$.fn.simpleGallery.defaults = {

		'items'       : '> *',
		'loop'        : true,
		'slider'      : '> *:first',
		'infinite'    : false,
        'gallery'     : false

	}

})( jQuery );
