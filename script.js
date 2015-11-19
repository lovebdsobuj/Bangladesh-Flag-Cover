/*  @preserve
 *  Project: Bangladesh Flag Cover
 *  Description: Puts a Bangladesh flag filter over your photo.
 *  Author: Zzbaivong (devs.forumvi.com)
 *  Version: 0.1
 *  License: MIT
 */
(function ($) {

    'use strict';

    /**
     * Get image data
     * @param {Array} files
     */
    function readerImage(files) {
        if (files.length && files[0].type.indexOf('image/') === 0) {
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = function (_file) {
                generator(_file.target.result, false);
            };
        }
    }

    // Upload success or error
    function endUpload() {
        setTimeout(function () {
            $get.text('Get link');
        }, 300);
        $progress.removeAttr('style');
        $download.removeClass('progress');
    }

    // Upload image to Imgur
    function upToImgur() {
        uploadImage = $.ajax({
            url: 'https://api.imgur.com/3/image',
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100) + '%';
                        $progress.width(percentComplete);
                        $get.text(percentComplete);
                    }
                }, false);
                return xhr;
            },
            method: 'POST',
            headers: {
                Authorization: 'Client-ID b558ac1b6bb7a20'
            },
            data: {
                image: dataUrl.replace(/.*,/, ''),
                type: 'base64'
            },
            success: function (result) {
                $result.val(result.data.link).fadeIn().focus();
                $get.fadeOut();
                dataUrl = null;
                endUpload();
            },
            error: function (json) {
                endUpload();
                console.log(json);
            }
        });
    }

    /**
     * Rainbow image gen
     * @param {String} url Image url
     */
    function generator(url, cross) {
        $wrap_img.addClass('generator');
        rainbowLGBT(url, cross, 520, function (img) {
            dataUrl = img;
            $wrap_img.html('<a href="' + img + '" download="CelebratePride.jpg"><img src="' + img + '" alt="Celebrate Pride"></a>');
            $input.prop('disable', false).val('');
            $add.slideUp('fast');
            $complete.slideDown('fast');
            $submit.removeAttr('style');
        });
    }

    /**
     * Puts a filter over image
     * @param  {String}   url      Image url
     * @param  {Boolean}   cross    CrossOrigin
     * @param  {Number}   cw       Image width
     * @param  {Function} callback Export to base64 image
     */
    function rainbowLGBT(url, cross, cw, callback) {
        var img = new Image();
        if (cross) {
            img.crossOrigin = 'Anonymous';
        }
        img.onload = function () {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');

            var w = this.width, // image height
                h = this.height, // image width                
                rh = h * cw / w, // ratio height
                rw = cw, // ratio width
                oneTenths = cw / 10, // 1/10 canvas width
                ch = oneTenths * 6; // canvas height
            if (rh < ch) {
                rw = ch * cw / rh;
                rh = ch;
            }
            $wrap_img.height(ch);

            canvas.width = cw;
            canvas.height = ch;

            ctx.drawImage(this, 0, 0, rw, rh);

            ctx.globalAlpha = 0.4;
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, cw, ch);
            ctx.fillStyle = 'red';
            ctx.arc(oneTenths * 4.5, oneTenths * 3, oneTenths * 2, 0, 2 * Math.PI);
            ctx.fill();

            var dataURL = canvas.toDataURL('image/jpeg');
            if (typeof callback === 'function') {
                callback(dataURL);
            }
            canvas = null;
        };
        img.onerror = function () {
            $submit.css('backgroundImage', 'url(img/cancel.png)');
            $wrap_img.removeClass('generator');
        };
        img.src = url;
    }

    var uploadImage,
        dataUrl = null,
        $wrap_img = $('#celebrate-img'),
        $add = $('#celebrate-add'),
        $input = $('#celebrate-input'),
        $submit = $('#celebrate-submit'),
        $complete = $('#celebrate-complete'),
        $reset = $('#celebrate-reset'),
        $download = $('#celebrate-download'),
        $progress = $('#celebrate-progress'),
        $get = $('#celebrate-get'),
        $result = $('#celebrate-result');

    $add.on('submit', function (event) {
        event.preventDefault();
        $input.prop('disable', true);
        $submit.css('backgroundImage', 'url(img/load.gif)');
        generator($input.val(), true);
    });

    $input.on('input', function () {
        var val = $input.val();
        if ($.trim(val) === '') {
            $submit.css('backgroundImage', 'url(img/enter.png)');
        } else if (val.indexOf('http') === 0) {
            $submit.css('backgroundImage', 'url(img/ok.png)');
        } else {
            $submit.css('backgroundImage', 'url(img/cancel.png)');
        }
    });

    //$wrap_img.on('dragenter', function () {
    //    event.preventDefault();
    //    $wrap_img.addClass('dragging');
    //});

    $wrap_img.on('dragover', function (event) {
        event.preventDefault();
        $wrap_img.addClass('dragging');
    });

    $wrap_img.on('dragleave', function (event) {
        event.preventDefault();
        $wrap_img.removeClass('dragging');
    });

    $wrap_img.on('click', function () {
        if (!$wrap_img.hasClass('generator')) {
            $('#celebrate-file').click();
        }
    });

    $wrap_img.on('drop dragdrop', function (event) {
        event.preventDefault();
        $wrap_img.removeClass('dragging');
        readerImage(event.originalEvent.dataTransfer.files);
    });

    $download.on('click', function () {
        if (!$download.hasClass('progress') && dataUrl !== null) {
            $download.addClass('progress');
            upToImgur();
        }
    });

    $result.on('focus click mouseenter', function () {
        $result[0].select();
    });

    $('html').on('change', '#celebrate-file', function () {
        readerImage(this.files);
        $('#celebrate-file').replaceWith('<input id="celebrate-file" type="file" accept="image/*">');
    });

    $reset.on('click', function () {
        $wrap_img.removeAttr('style').html('<div><strong>Drop image</strong><br><span>(or click)</span></div>').removeClass('generator');
        $add.slideDown('fast');
        $complete.slideUp('fast');
        $submit.removeAttr('style');
        $progress.removeAttr('style');
        $get.text('Get link').show();
        $result.hide();
        $download.removeClass('progress');
        if (uploadImage) {
            uploadImage.abort();
        }
    });

}(jQuery));