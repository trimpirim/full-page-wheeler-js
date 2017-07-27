const Wheeler = {
    timer: null,
    wheeled: false,
    blocks: [],
    active: null,
    index: 0,
    wrapper: null,
    touchstart: 0,
    options: {
        leaving() {
            // $(document).trigger('wheeler:leaving')
        },
        enteredLast() {
            // $(document).trigger('wheeler:entered-last')
        },
        enteredFirst() {
            // $(document).trigger('wheeler:entered-first')
        },
        leavedFirst() {
            
        },
        leavedLast() {

        },
        delay: 1000,
        scrollables: [],
        navigation: null
    },
    methods: {
        leaving(index, previous, direction, activeElement) {
            $(document).trigger('wheeler:leaving', [index, previous, direction, activeElement])
            Wheeler.options.leaving.apply(Wheeler, [index, previous, direction, activeElement])
        },
        enteredLast() {
            $(document).trigger('wheeler:entered-last', [Wheeler.active])
            Wheeler.options.enteredLast.apply(Wheeler, Wheeler.active)
        },
        enteredFirst() {
            $(document).trigger('wheeler:entered-first', [Wheeler.active])
            Wheeler.options.enteredFirst.apply(Wheeler, Wheeler.active);
        },
        leavedFirst() {
            $(document).trigger('wheeler:leaved-first', [Wheeler.active])
            Wheeler.options.leavedFirst.apply(Wheeler, Wheeler.active)
        },
        leavedLast() {
            $(document).trigger('wheeler:leaved-last', [Wheeler.active])
            Wheeler.options.leavedLast.apply(Wheeler, Wheeler.active)
        }
    },

    CONSTANTS: {
        DIRECTION: {
            UP: 1,
            DOWN: 0
        }
    },
    scrolled: 0,

    parseOptions(options) {
        options = options || {}
        const parsedOptions = Wheeler.options
        parsedOptions.enteredFirst = options.enteredFirst || parsedOptions.enteredFirst
        parsedOptions.enteredLast = options.enteredLast || parsedOptions.enteredLast
        parsedOptions.leaving = options.leaving || parsedOptions.leaving
        parsedOptions.leavedFirst = options.leavedFirst || parsedOptions.leavedFirst
        parsedOptions.leavedLast = options.leavedLast || leavedLasts.leaving
        parsedOptions.delay = options.delay || parsedOptions.delay
        parsedOptions.scrollables = options.scrollables || parsedOptions.scrollables
        parsedOptions.navigation = options.navigation || parsedOptions.navigation
        return parsedOptions
    },

    init(blockSelector, options) {
        Wheeler.options = Wheeler.parseOptions(options)
        Wheeler.blocks = $(blockSelector)
        if (Wheeler.blocks.length > 0) {
            Wheeler.activateByIndex(Wheeler.index)
            Wheeler.wrapper = Wheeler.active.closest('.js-wheeler')
            Wheeler.addAdditionalClassesByIndex(Wheeler.index)
            Wheeler.handle()
            Wheeler.handleNavigation()
            Wheeler.handleNavigationNextPrev()
        }
    },

    addAdditionalClassesByIndex(index) {
        const classes = {
            first: 'js-wheeler-first-block wheeler-first-block',
            last: 'js-wheeler-last-block wheeler-last-block'
        }

        Wheeler.wrapper.removeClass('js-wheeler-first-block wheeler-first-block js-wheeler-last-block wheeler-last-block')
        if (index == Wheeler.blocks.length - 1) {
            Wheeler.wrapper.addClass(classes.last)
            Wheeler.methods.enteredLast()
        } else if (index == 0) {
            Wheeler.wrapper.addClass(classes.first)
            Wheeler.methods.enteredFirst()
        }
    },

    callCallbacksByIndices(currentIndex, previousIndex) {
        if (previousIndex === Wheeler.blocks.length - 1) {
            Wheeler.methods.leavedLast()
        } else if (previousIndex === 0) {
            Wheeler.methods.leavedFirst()
        }
    },

    activateByIndex(index) {
        Wheeler.blocks.removeClass('js-wheeler-active wheeler-active')

        Wheeler.active = $(Wheeler.blocks[index])
        Wheeler.active.addClass('js-wheeler-active wheeler-active')
    },

    markAsPreviousByIndex(index) {
        Wheeler.blocks.removeClass('js-wheeler-previously-active wheeler-previously-active')

        $(Wheeler.blocks[index]).addClass('js-wheeler-previously-active wheeler-previously-active')
    },

    indexByDirection(direction) {
        const previousIndex = Wheeler.index
        let currentIndex = Wheeler.index

        switch (direction) {
            case Wheeler.CONSTANTS.DIRECTION.DOWN:
                currentIndex += 1
                break
            case Wheeler.CONSTANTS.DIRECTION.UP:
                currentIndex -= 1
                break
        }

        if (currentIndex < 0 || currentIndex > Wheeler.blocks.length - 1) {
            return false
        }

        return {
            current: currentIndex,
            previous: previousIndex
        }
    },

    activateByDirection(direction) {
        const indices = Wheeler.indexByDirection(direction)

        if (!indices) {
            return false
        }

        Wheeler.activateByIndexAndCallCallbacks(indices.current, indices.previous)
    },

    activateByIndexAndCallCallbacks(index, previous) {
        Wheeler.index = index

        Wheeler.markAsPreviousByIndex(previous)
        Wheeler.activateByIndex(index)
        Wheeler.addAdditionalClassesByIndex(index)
        Wheeler.callCallbacksByIndices(index, previous)

        Wheeler.methods.leaving.apply(Wheeler, [index, previous, null, Wheeler.active])
    },

    clearTimer() {
        clearTimeout(Wheeler.timer)
        Wheeler.timer = null
    },

    markAsWheeled() {
        Wheeler.wrapper.addClass('js-wheeler-wheeled wheeler-wheeled')
    },

    activateAndMarkWheeled(direction) {
        Wheeler.scrolled = 0
        Wheeler.activateByDirection(direction)
        Wheeler.markAsWheeled()
    },

    handle() {
        $(window).on('wheel mousewheel DOMMouseScroll MozMousePixelScroll', (ev) => {
            if (!Wheeler.timer && Wheeler.scrolled === 0) {
                Wheeler.timer = setTimeout(() => {
                    Wheeler.wheeled = false
                    Wheeler.clearTimer()
                }, Wheeler.options.delay)
            }

            if (!Wheeler.wheeled) {
                Wheeler.wheeled = true

                const delta = ev.originalEvent.wheelDelta || -ev.originalEvent.deltaY;

                const direction = Wheeler.direction(delta)

                if (!Wheeler.wheelable()) {
                    const scrollable = Wheeler.scrollableElement()
                    $(scrollable).on('wheel mousewheel DOMMouseScroll MozMousePixelScroll', function(ev) {
                        const scrollPosition = $(this).scrollTop()

                        const delta = ev.originalEvent.wheelDelta || -ev.originalEvent.deltaY;
                        const direction = Wheeler.direction(delta)

                        if (scrollPosition === 0) {
                            Wheeler.activateAndMarkWheeled(direction)
                            $(scrollable).off('wheel mousewheel DOMMouseScroll MozMousePixelScroll')
                        }
                    })
                } else {
                    Wheeler.activateAndMarkWheeled(direction)
                }
            }
        })

        $(window).on('touchend', function(ev) {
            const end = ev.originalEvent.changedTouches[0].clientY

            const delta = end - Wheeler.touchstart

            if ((delta > 0 && delta > 200 )|| (delta < 0 && delta < -200)) {

                const direction = Wheeler.direction(delta)

                if (!Wheeler.wheelable()) {
                    const scrollable = Wheeler.scrollableElement()
                    $(scrollable).on('scroll', function(ev) {
                        const scrollPosition = $(this).scrollTop()
                        if (scrollPosition === 0) {
                            Wheeler.activateAndMarkWheeled(direction)
                            $(scrollable).off('scroll')
                        }
                    })
                } else {
                    Wheeler.activateAndMarkWheeled(direction)
                }
            }
        })

        $(window).on('touchstart', function(ev) {
            Wheeler.touchstart = ev.originalEvent.touches[0].clientY
        });
    },

    handleNavigation() {
        const navigation = $(Wheeler.options.navigation)
        if (navigation.length > 0) {
            navigation.on('click', function() {
                const index = $(this).data('wheeler-to-page')
                Wheeler.activateByIndexAndCallCallbacks(index, Wheeler.index)
            })
        }
    },

    handleNavigationNextPrev() {
        const button = $('.js-wheeler-navigation-next-prev')
        button.on('click', function() {
            if (Wheeler.index >= Wheeler.blocks.length - 1) {
                Wheeler.activateByIndexAndCallCallbacks(Wheeler.index - 1, Wheeler.index)
            } else {
                Wheeler.activateByIndexAndCallCallbacks(Wheeler.index + 1, Wheeler.index)
            }
        })
    },

    scrollableElement() {
        const filtered = this.options.scrollables.map(scrollable => {
            return $(scrollable)
        }).filter(scrollable => {
            return Wheeler.active.is(scrollable)
        })

        return filtered.length === 0 ? false : filtered[0]
    },

    wheelable() {
        return !(!!Wheeler.scrollableElement())
    },

    direction(wheelDelta) {
        return wheelDelta < 0 ? Wheeler.CONSTANTS.DIRECTION.DOWN : Wheeler.CONSTANTS.DIRECTION.UP
    }
}

export default Wheeler