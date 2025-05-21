import { Fragment } from 'react';
import { HeaderProduct } from '@pagopa/mui-italia/dist/components/HeaderProduct/HeaderProduct';
import { HeaderAccount } from '@pagopa/mui-italia/dist/components/HeaderAccount/HeaderAccount';
import {
  RootLinkType,
  UserAction,
  ProductSwitchItem,
  ProductEntity,
  LangCode,
} from '@pagopa/mui-italia';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { ENV } from '../utils/env';
import { buildAssistanceURI } from '../services/assistanceService';
import { useLoginData } from '../hooks/useLoginData';
import { mapClientToProduct } from '../utils/utils';
import { ImageWithFallback } from './ImageFallback';
import {
  IDP_PLACEHOLDER_IMG,
  ROUTE_LOGIN,
  ROUTE_LOGOUT,
} from '../utils/constants';
import i18n from '../locale';

type PartyEntity = PartySwitchItem;
type HeaderProps = {
  /** If true, it will render an other toolbar under the Header */
  withSecondHeader: boolean;
  /** The list of products in header */
  productsList?: Array<ProductEntity>;
  /** The party id selected */
  selectedPartyId?: string;
  /** The product id selected */
  selectedProductId?: string;
  /** The parties list */
  partyList?: Array<PartyEntity>;

  /** The function invoked when the user click on a product */
  onSelectedProduct?: (product: ProductSwitchItem) => void;
  /** The function invoked when the user click on a party from the switch  */
  onSelectedParty?: (party: PartySwitchItem) => void;
  /** The function to be invoked when pressing the rendered logout button, if not defined it will redirect to the logout page, if setted to null it will no render the logout button. It's possible to modify the logout path changing the value in CONFIG.logout inside the index.tsx file */
  onExit?: (exitAction: () => void) => void;
  /** The users actions inside the user dropdown. It's visible only if enableLogin and enableDropdown are true */
  userActions?: Array<UserAction>;
  /** If true the user dropdown in headerAccount component is visible. It's visible only if enableLogin is true */
  enableDropdown?: boolean;
  /* The number of characters beyond which the multiLine is applied in component PartyAccountItemButton */
  maxCharactersNumberMultiLineButton?: number;
  /* The number of characters beyond which the multiLine is applied in component PartyAccountItem */
  maxCharactersNumberMultiLineItem?: number;
  /** If false hides assistance button */
  enableAssistanceButton?: boolean;
};

const rootLink: RootLinkType = {
  label: 'PagoPA S.p.A.',
  href: ENV.HEADER.LINK.PAGOPALINK,
  ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
  title: 'Sito di PagoPA S.p.A.',
};

/** Header component */
const Header = ({
  withSecondHeader,
  selectedPartyId,
  partyList = [],
  userActions = [],
  enableDropdown = false,
  onExit = (exitAction) => exitAction(),
  onSelectedProduct,
  onSelectedParty,
  maxCharactersNumberMultiLineButton,
  maxCharactersNumberMultiLineItem,
}: HeaderProps) => {
  const { clientQuery } = useLoginData();
  const lang: LangCode = i18n.language as LangCode;
  const themeParam = encodeURIComponent(
    new URLSearchParams(window.location.search).get('theme') || 'default'
  );
  const localizedContent =
    clientQuery.data?.localizedContentMap?.[themeParam]?.[lang];

  const getClientLogo = () => (
    <>
      {clientQuery.isFetched && (
        <ImageWithFallback
          style={{
            width: '100%',
            maxWidth: '56px',
            maxHeight: '56px',
            objectFit: 'cover',
          }}
          src={clientQuery.data?.logoUri}
          alt={clientQuery.data?.friendlyName || 'PagoPa Logo'}
          placeholder={IDP_PLACEHOLDER_IMG}
        />
      )}
    </>
  );

  if (!clientQuery.data?.logoUri) {
    withSecondHeader = false; // deactivate header if logo is null
  }
  const product = mapClientToProduct(clientQuery.data, getClientLogo());

  // Enable documentation button if docUri is present
  const onDocumentationClick = localizedContent?.docUri
    ? () => window.open(localizedContent?.docUri, '_blank')
    : undefined;

  // The string wich could represent a valid email address or URL to help users to get assistance
  let assistanceString = '';

  // enable assistance fallback whether assistance is enabled and email is set
  if (ENV.FALLBACK_ASSISTANCE.ENABLE && ENV.FALLBACK_ASSISTANCE.EMAIL) {
    assistanceString = ENV.FALLBACK_ASSISTANCE.EMAIL;
  }
  assistanceString = localizedContent?.supportAddress || assistanceString;

  return (
    <Fragment>
      <header>
        <HeaderAccount
          rootLink={rootLink}
          onAssistanceClick={() =>
            onExit(() =>
              window.open(buildAssistanceURI(assistanceString) || '', '_blank')
            )
          }
          onLogin={() => onExit(() => window.location.assign(ROUTE_LOGIN))}
          onLogout={() => onExit(() => window.location.assign(ROUTE_LOGOUT))}
          userActions={userActions}
          enableDropdown={enableDropdown}
          enableAssistanceButton={!!assistanceString}
          onDocumentationClick={onDocumentationClick}
          enableLogin={false}
        />
      </header>
      {withSecondHeader === true && product ? (
        <nav>
          <HeaderProduct
            productId={product?.id}
            productsList={[product]}
            partyId={selectedPartyId}
            partyList={partyList}
            onSelectedProduct={onSelectedProduct}
            onSelectedParty={onSelectedParty}
            maxCharactersNumberMultiLineButton={
              maxCharactersNumberMultiLineButton
            }
            maxCharactersNumberMultiLineItem={maxCharactersNumberMultiLineItem}
          />
        </nav>
      ) : (
        ''
      )}
    </Fragment>
  );
};

export default Header;
