/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import settings from 'carbon-components/es/globals/js/settings';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, property, query, customElement, LitElement } from 'lit-element';
import ChevronDownGlyph from '@carbon/icons/lib/chevron--down/16';
import FocusMixin from '../../globals/mixins/focus';
import HostListenerMixin from '../../globals/mixins/host-listener';
import HostListener from '../../globals/decorators/host-listener';
import { forEach } from '../../globals/internal/collection-helpers';
import styles from './header.scss';

const { prefix } = settings;

/**
 * Header menu.
 *
 * @element bx-header-menu
 * @csspart trigger The trigger button.
 * @csspart trigger-icon The trigger button icon.
 * @csspart menu-body The menu body.
 */
@customElement(`${prefix}-header-menu`)
class BXHeaderMenu extends HostListenerMixin(FocusMixin(LitElement)) {
  /**
   * The trigger button.
   */
  @query('a')
  private _trigger!: HTMLElement;

  /**
   * Handles `click` event handler on this element.
   */
  private _handleClick() {
    this._handleUserInitiatedToggle();
  }

  /**
   * Handler for the `keydown` event on the trigger button.
   */
  private _handleKeydownTrigger({ key }: KeyboardEvent) {
    if (key === 'Esc' || key === 'Escape') {
      this._handleUserInitiatedToggle(false);
    }
  }

  /**
   * Handles user-initiated toggling the open state.
   *
   * @param [force] If specified, forces the open state to the given one.
   */
  private _handleUserInitiatedToggle(force: boolean = !this.expanded) {
    this.expanded = force;
    if (!force) {
      this._trigger.focus();
    }
  }

  /**
   * Handles `blur` event handler on this element.
   */
  @HostListener('focusout')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleBlur({ relatedTarget }: FocusEvent) {
    if (!this.contains(relatedTarget as Node)) {
      this.expanded = false;
    }
  }

  /**
   * `true` if the menu should be expanded.
   */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /**
   * The content of the trigger button.
   */
  @property({ attribute: 'trigger-content' })
  triggerContent = '';

  /**
   * The `aria-label` attribute for the menu UI.
   */
  @property({ attribute: 'menu-label' })
  menuLabel!: string;

  createRenderRoot() {
    return this.attachShadow({
      mode: 'open',
      delegatesFocus: true,
    });
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
    super.connectedCallback();
  }

  updated(changedProperties) {
    if (changedProperties.has('expanded')) {
      const { selectorItem } = this.constructor as typeof BXHeaderMenu;
      const { expanded } = this;
      forEach(this.querySelectorAll(selectorItem), (elem) => {
        (elem as HTMLElement).tabIndex = expanded ? 0 : -1;
      });
    }
  }

  render() {
    const {
      expanded,
      triggerContent,
      menuLabel,
      _handleClick: handleClick,
      _handleKeydownTrigger: handleKeydownTrigger,
    } = this;
    return html`
      <a
        part="trigger"
        tabindex="0"
        class="${prefix}--header__menu-item ${prefix}--header__menu-title"
        href="javascript:void 0"
        aria-haspopup="menu"
        aria-expanded="${String(Boolean(expanded))}"
        @click=${handleClick}
        @keydown=${handleKeydownTrigger}
      >
        ${triggerContent}${ChevronDownGlyph({
          part: 'trigger-icon',
          class: `${prefix}--header__menu-arrow`,
        })}
      </a>
      <ul
        part="menu-body"
        class="${prefix}--header__menu"
        aria-label="${ifDefined(menuLabel)}"
      >
        <slot></slot>
      </ul>
    `;
  }

  /**
   * A selector that will return the menu items.
   */
  static get selectorItem() {
    return `${prefix}-header-menu-item`;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}

export default BXHeaderMenu;
