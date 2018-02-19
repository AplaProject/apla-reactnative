import * as React from 'react';
import * as PropTypes from 'prop-types';
import { View, TouchableOpacity, DeviceInfo, TouchableWithoutFeedback } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import { View as AnimatableView } from 'react-native-animatable';

import MenuContainer from 'containers/MenuContainer';
import AccountListContainer from 'containers/AccountListContainer';
import Button from 'components/ui/Button';
import Text from 'components/ui/Text';
import AppVersion from 'components/AppVersion';
import Logo from 'components/ui/Logo';

import styles from './styles';
import TransactionsContainer from 'containers/TransactionsContainer';

interface IDrawerContentProps {
  currentAccountAddress: string;
  logout: () => void;
  switchAccount: (accountAdress: string, ecosystemId: string) => void;
}

interface IDrawerContentState {
  showAccountList: boolean;
  isIphoneX: boolean;
  activeTab: string;
}

const logoutButtonProps = {
  intl: {
    id: 'logout',
    defaultMessage: 'Logout'
  }
};

const avatarDefaultProps = {
  iconStyle: {
    color: '#fff'
  },
  type: 'font-awesome',
  name: 'user-circle',
  size: 32
};

const tabButtons = [
  {
    title: 'Accounts',
    payload: 'accounts',
  },
  {
    title: 'Transactions',
    payload: 'transactions',
  },
];

class DrawerContent extends React.Component<
  IDrawerContentProps,
  IDrawerContentState
> {
  public static contextTypes = {
    drawer: PropTypes.object
  };

  constructor(props: IDrawerContentProps) {
    super(props);

    this.state = {
      showAccountList: false,
      isIphoneX: DeviceInfo.isIPhoneX_deprecated,
      activeTab: 'accounts',
    };
  }

  public render() {
    const { isIphoneX, activeTab } = this.state;

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'never', horizontal: 'never' }}>
        <Button title="logout" onPress={this.handleLogoutButtonPress}/>
        <View style={[styles.insetContainer, { paddingBottom: isIphoneX ? 34 : 0 }]}>
          <Logo />
          <View style={styles.switcher}>
            {tabButtons.map((item, i) => {
              return (
                <TouchableWithoutFeedback
                  onPress={() => this.handlePressTab(item.payload)}
                  key={i}>
                  <View style={styles.switcherButtonWrapper}>
                    <Text style={styles.switcherButtonTitle}>{item.title}</Text>
                    <AnimatableView
                      animation={item.payload === activeTab ? 'fadeIn' : 'fadeOut'}
                      easing="linear"
                      duration={150}
                      useNativeDriver
                      iterationCount={1}
                      style={styles.decorLine}/>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
          {activeTab === 'accounts'
            ? (
              <AnimatableView
                easing="linear"
                duration={250}
                iterationCount={1}
                useNativeDriver
                style={{ flex: 1 }}
                animation={'fadeIn'}>
                <AccountListContainer noTitle />
              </AnimatableView>
            )
            : (
              <AnimatableView
                easing="linear"
                duration={250}
                iterationCount={1}
                useNativeDriver
                style={{ flex: 1 }}
                animation={'fadeOut'}>
                <TransactionsContainer />
              </AnimatableView>
            )
          }
        </View>
      </SafeAreaView>
    );
  }

  private handlePressTab = (value: string) => {
    const { activeTab } = this.state;

    if (value !== activeTab) {
      this.setState({
        activeTab: value,
      });
    }
  }

  private handleTogglePress = () => {
    this.setState(prevState => ({
      showAccountList: !prevState.showAccountList
    }));
  }

  private handleAccountSelect = (accountAdress: string, ecosystemId: string) => {
    this.context.drawer.close(() => {
      this.props.switchAccount(accountAdress, ecosystemId);
    });
  }

  private handleLogoutButtonPress = () => {
    this.context.drawer.close(() => {
      this.props.logout();
    });
  }
}

export default DrawerContent;
