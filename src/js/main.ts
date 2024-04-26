class Leaflet {
    private $hand: HTMLElement;
    private $leaflet: HTMLElement;
    private $pageElems: HTMLElement[];
    private _pageCount = 0;
    private _currentMenu: HTMLElement | null = null;
    private _handPos = { x: 0, y: 0 };
    private _targetPos = { x: 0, y: 0 };
    private _distX: number | null = null;
    private _distY: number | null = null;

    constructor() {
        this.$hand = document.querySelector('.hand')!;
        this.$leaflet = document.querySelector('.leaflet')!;
        this.$pageElems = [...document.querySelectorAll('.page')!] as HTMLElement[];
        this.$leaflet.addEventListener('click', this._handleClick.bind(this));
        this.$leaflet.addEventListener('animationend', this._handleAnimationEnd.bind(this));
        window.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this._render();
    }

    private _getTarget(elem: HTMLElement, className: string): HTMLElement | null {
        while (!elem.classList.contains(className)) {
            elem = elem.parentNode as HTMLElement;

            if (elem.nodeName == 'BODY') {
                return null;
            }
        }

        return elem;
    }

    private _closeLeaflet(): void {
        this._pageCount = 0;
        document.body.classList.remove('leaflet-opened');
        this.$pageElems[2].classList.remove('page-flipped');
        setTimeout(() => {
            this.$pageElems[0].classList.remove('page-flipped');
        }, 500);
    }

    private _zoomIn(elem: HTMLElement): void {
        const rect = elem.getBoundingClientRect();
        const dx = window.innerWidth / 2 - (rect.x + rect.width / 2);
        const dy = window.innerHeight / 2 - (rect.y + rect.height / 2);
        let angle;

        const page: number = parseInt((elem?.parentNode?.parentNode?.parentNode as HTMLElement)?.dataset.page ?? '2');

        switch (page) {
            case 1:
                angle = -30;
                break;
            case 2:
                angle = 0;
                break;
            case 3:
                angle = 30;
                break;
        }

        document.body.classList.add('zoom-in');
        this.$leaflet.style.transform = `translate3d(${dx}px, ${dy}px, 50vw) rotateY(${angle}deg)`;
        this._currentMenu = elem;
        this._currentMenu.classList.add('current-menu');
    }

    private _zoomOut(): void {
        this.$leaflet.style.transform = 'translate3d(0, 0, 0)';
        if (this._currentMenu) {
            document.body.classList.remove('zoom-in');
            this._currentMenu.classList.remove('current-menu');
            this._currentMenu = null;
        }
    }

    private _render(): void {
        this._distX = this._targetPos.x - this._handPos.x;
        this._distY = this._targetPos.y - this._handPos.y;
        this._handPos.x = this._handPos.x + this._distX * 0.1;
        this._handPos.y = this._handPos.y + this._distY * 0.1;
        this.$hand.style.transform = `translate(${this._handPos.x - 60}px, ${this._handPos.y + 30}px)`;
        requestAnimationFrame(this._render.bind(this));
    }

    private _handleClick(e: MouseEvent): void {
        if (!e.target) return;

        const pageElem = this._getTarget(e.target as HTMLElement, 'page');

        if (pageElem) {
            pageElem.classList.add('page-flipped');
            this._pageCount++;

            if (this._pageCount == 2) {
                document.body.classList.add('leaflet-opened');
            }
        }

        const closeBtnElem = this._getTarget(e.target as HTMLElement, 'close-btn');
        if (closeBtnElem) {
            this._closeLeaflet();
            this._zoomOut();
        }

        const menuItemElem = this._getTarget(e.target as HTMLElement, 'menu-item');
        if (menuItemElem) {
            if (!document.body.classList.contains('zoom-in')) {
                this._zoomIn(menuItemElem);
            }
        }

        const backBtn = this._getTarget(e.target as HTMLElement, 'back-btn');
        if (backBtn) {
            this._zoomOut();
        }
    }

    private _handleAnimationEnd(): void {
        this.$leaflet.style.animation = 'none';
    }

    private _handleMouseMove(e: MouseEvent): void {
        this._targetPos.x = e.clientX - window.innerWidth * 0.7;
        this._targetPos.y = e.clientY - window.innerHeight * 0.7;
    }
}

window.onload = function () {
    new Leaflet();
};
