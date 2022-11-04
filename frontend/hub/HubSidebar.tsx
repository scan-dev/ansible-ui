import {
  Nav,
  NavExpandable,
  NavItem,
  NavItemSeparator,
  NavList,
  PageSidebar,
  Split,
  SplitItem,
} from '@patternfly/react-core'
import { ExternalLinkAltIcon } from '@patternfly/react-icons'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../../framework'
import { useSettings } from '../../framework/Settings'
import { AutomationServerSwitcher } from '../automation-servers/AutomationServerSwitcher'
import { isRouteActive } from '../common/Masthead'
import { RouteE } from '../Routes'

export function HubSidebar(props: { isNavOpen: boolean; setNavOpen: (open: boolean) => void }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const settings = useSettings()

  const isXl = useBreakpoint('xl')
  const { isNavOpen, setNavOpen } = props
  const onClick = useCallback(
    (route: RouteE) => {
      navigate(route)
      if (!isXl) {
        setNavOpen(false)
      }
    },
    [navigate, isXl, setNavOpen]
  )
  return (
    <PageSidebar
      isNavOpen={isNavOpen}
      style={{
        backgroundColor:
          settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
      }}
      nav={
        <>
          <Nav>
            <NavList>
              <NavItemSeparator style={{ margin: 0 }} />
              <NavItem
                isActive={isRouteActive(RouteE.HubAutomationServers, location)}
                onClick={() => onClick(RouteE.HubAutomationServers)}
              >
                {t('Automation Servers')}
              </NavItem>
              <AutomationServerSwitcher />
              <NavItemSeparator style={{ margin: 0 }} />
              <NavItem
                isActive={isRouteActive(RouteE.HubDashboard, location)}
                onClick={() => onClick(RouteE.HubDashboard)}
              >
                {t('Dashboard')}
              </NavItem>
              <NavExpandable
                key="automation-content"
                title={t('Automation Content')}
                isExpanded
                isActive={isRouteActive(
                  [RouteE.Collections, RouteE.Namespaces, RouteE.Repositories],
                  location
                )}
              >
                <NavItem
                  isActive={isRouteActive(RouteE.Namespaces, location)}
                  onClick={() => onClick(RouteE.Namespaces)}
                >
                  {t('Namespaces')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.Collections, location)}
                  onClick={() => onClick(RouteE.Collections)}
                >
                  {t('Collections')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.HubExecutionEnvironments, location)}
                  onClick={() => onClick(RouteE.HubExecutionEnvironments)}
                >
                  {t('Execution environments')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.SignatureKeys, location)}
                  onClick={() => onClick(RouteE.SignatureKeys)}
                >
                  {t('Signature keys')}
                </NavItem>
              </NavExpandable>
              <NavExpandable
                key="administration"
                title={t('Administration')}
                isExpanded
                isActive={isRouteActive(
                  [RouteE.HubExecutionEnvironments, RouteE.RemoteRegistries],
                  location
                )}
              >
                <NavItem
                  isActive={isRouteActive(RouteE.Repositories, location)}
                  onClick={() => onClick(RouteE.Repositories)}
                >
                  {t('Repositories')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.RemoteRegistries, location)}
                  onClick={() => onClick(RouteE.RemoteRegistries)}
                >
                  {t('Remote registries')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.Tasks, location)}
                  onClick={() => onClick(RouteE.Tasks)}
                >
                  {t('Tasks')}
                </NavItem>
                <NavItem
                  isActive={isRouteActive(RouteE.Approvals, location)}
                  onClick={() => onClick(RouteE.Approvals)}
                >
                  {t('Approvals')}
                </NavItem>
              </NavExpandable>

              <NavExpandable
                key="access"
                title={t('Access')}
                isExpanded
                isActive={isRouteActive(
                  [RouteE.HubExecutionEnvironments, RouteE.RemoteRegistries],
                  location
                )}
              >
                <NavItem
                  isActive={isRouteActive(RouteE.APIToken, location)}
                  onClick={() => onClick(RouteE.APIToken)}
                >
                  {t('API token')}
                </NavItem>
              </NavExpandable>

              <NavItem
                onClick={() =>
                  window.open(
                    'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
                    '_blank'
                  )
                }
              >
                <Split>
                  <SplitItem isFilled>{t('Documentation')}</SplitItem>
                  <SplitItem>
                    <ExternalLinkAltIcon />
                  </SplitItem>
                </Split>
              </NavItem>
            </NavList>
          </Nav>
        </>
      }
    />
  )
}
