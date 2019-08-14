(function () {

  function maskPhoneInput($el) {
    var mask1 = $el.attr('placeholder').replace(/[0-9]/g, 0)
    $el.mask(mask1).attr('maxlength', null)
  }

  function initPhoneField($el = null, $form = null) {

    let $phoneCountryCodeEl = $form.find('[name=phone_country_code]')
    let $phoneNationalNumberEl = $form.find('[name=phone_national_number]')

    if (!$phoneCountryCodeEl.length) {
      $phoneCountryCodeEl = $('<input type="hidden" name="phone_country_code">')
      $form.append($phoneCountryCodeEl)
    }

    if (!$phoneNationalNumberEl.length) {
      $phoneNationalNumberEl = $('<input type="hidden" name="phone_national_number">')
      $form.append($phoneNationalNumberEl)
    }

    $el.intlTelInput({
      initialCountry: "auto",
      autoPlaceholder: "aggressive",
      separateDialCode: true,
      preferredCountries: ["fr", "gb"],
      geoIpLookup: function (callback) {
        $.get('https://ipinfo.io', function () {
        }, "jsonp").always(function (resp) {
          var countryCode = (resp && resp.country) ? resp.country : ""
          callback(countryCode)
        })
      },
      utilsScript: "js/utils.js"
    })

    $el.on('countrychange', function (e) {
      const countryData = $(this).intlTelInput('getSelectedCountryData')
      const phoneCountryCode = countryData && countryData.dialCode

      if (phoneCountryCode) {
        $phoneCountryCodeEl.val(phoneCountryCode)
      }
      $el.val('')
      maskPhoneInput($el)
    })

    $el.on('change', function (e) {
      const number = $(this).val() ? $(this).val().replace(' ', '') : ''
      $phoneNationalNumberEl.val(number)
    })

  }

  function addValidatorMethods() {
    $.validator.addMethod("phone", function (value, element) {
        return true
      },
      "Please use only Latin characters.")

    $.validator.addMethod("emailField", function (value, element) {
        return /^([A-Za-z0-9_\-\.]{3,})+\@([A-Za-z0-9_\-\.]{1,})+\.([A-Za-z]{2,8})$/.test(value)
      },
      "Please enter a valid email address.")

    $.validator.addMethod("latin", function (value, element) {
        return /^([a-zA-Z]{1,})$/.test(value)
      },
      "Please use only Latin characters.")

    $.validator.addMethod("password", function (value, element) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(value)
      },
      "Passwords must be at least 8 characters, including a number, an uppercase letter, and a lowercase letter. Use only Latin characters.")

  }

  const HandlerList = {
    generatePassword: ($form, { buttonSelector, inputSelector}) => {

      $form.find(buttonSelector).on('click', function(e) {

        var pass = ""
        var strong = 12
        var dic = "Qq1Ww2Ee3Rr4Tt5Yy6Uu7Ii8Oo9Pp"

        for (var i = 0; i < strong; i++) {
          pass += dic.charAt(Math.floor(Math.random() * dic.length))
        }
        $form.find(inputSelector).val(pass)
      })

    },
    hidePassword: ($form, { hideButtonSelector, inputSelector}) => {

      const $showPasswordButton = $form.find(hideButtonSelector)
      $showPasswordButton.on('click', function(e) {

        const $passwordField = $form.find(inputSelector)

        const isVisible = $passwordField.data('Leadmob__hidePassword__visible')

        if (!isVisible) {
          $showPasswordButton.addClass('form__password--open')
          $passwordField.attr('type', 'text')

        } else {
          $showPasswordButton.removeClass('form__password--open')
          $passwordField.attr('type', 'password')
        }
        $passwordField.data('Leadmob__hidePassword__visible', !isVisible)
      })

    }
  }

  window.initFormHandlers = (form, options = {}) => {

    const o = {...options}

    addValidatorMethods()

    const $form = $(form)

    if (o.validate && o.validate.rules) {
      Object.keys(o.validate.rules).forEach(key => {

        const props = o.validate.rules[key]
        const $el = $form.find(`[name=${key}]`)

        if (props && props.latin) {

          $el.keypress(function (e) {
            var verified = String.fromCharCode(e.which).match(/[^a-zA-Z]/)
            if (verified) {
              e.preventDefault()
            }
          })

        }

        if (props && props.phone) {
          initPhoneField($el, $form)
        }

      })
    }

    if (o.handlers) {
      Object.keys(o.handlers).forEach(key => {
        const props = o.handlers[key]

        if (key in HandlerList) {
          const handler = HandlerList[key]
          handler($form, props)
        }

      })

    }

    $(form).validate(o.validate)
  }

})()
