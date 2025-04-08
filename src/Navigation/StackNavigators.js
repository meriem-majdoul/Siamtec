import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import * as theme from '../core/theme';
import { faArrowToRight, faInfo, faNewspaper, faVials } from 'react-native-vector-icons/FontAwesome5';
import { CustomIcon } from '../components';

// Import screens
// Auth
import { LoginScreen, ForgotPasswordScreen } from "../screens/Authentication";

// Dashboard
import Dashboard from '../screens/Dashboard/Dashboard';
import AddGoal from '../screens/Dashboard/AddGoal';

// Users & Teams Management
import UsersManagement from '../screens/Users/UsersManagement';
import CreateUser from '../screens/Users/CreateUser';
import CreateTeam from '../screens/Users/CreateTeam';
import AddMembers from '../screens/Users/AddMembers';
import ViewTeam from '../screens/Users/ViewTeam';

// Clients management
import ClientsManagement from '../screens/Clients/ClientsManagement';
import ListClients from '../screens/Clients/ListClients';
import CreateClient from '../screens/Clients/CreateClient';

// Requests Management
import RequestsManagement from '../screens/Requests/RequestsManagement';
import CreateProjectReq from '../screens/Requests/CreateProject';
import CreateTicketReq from '../screens/Requests/CreateTicket';

// Inbox
import Inbox from '../screens/Inbox/Inbox';
import ListMessages from '../screens/Inbox/ListMessages';
import ViewMessage from '../screens/Inbox/ViewMessage';
import NewMessage from '../screens/Inbox/NewMessage';
import ListNotifications from '../screens/Inbox/ListNotifications';

// Agenda
import Agenda from '../screens/Agenda/Agenda';
import CreateTask from '../screens/Agenda/CreateTask';
import ListEmployees from '../screens/Agenda/ListEmployees';
import DatePicker from '../screens/Helpers/DatePicker';

// Projects
import ListProjects from '../screens/Projects/ListProjects';
import CreateProject from '../screens/Projects/CreateProject';
import Process from '../screens/Process/Process';
import Progression from '../screens/src/screen/Progression';

// Documents
import ListDocuments from '../screens/Documents/ListDocuments';
import UploadDocument from '../screens/Documents/UploadDocument';
//import Signature from '../screens/Documents/Signature';
import PdfGeneration from '../screens/Documents/PdfGeneration';

// Orders
import ListOrders from '../screens/Orders/ListOrders';
import AddItem from '../screens/Orders/AddItem';
import CreateProduct from '../screens/Orders/CreateProduct';
import CreateOrder from '../screens/Orders/CreateOrder';

// Forms
// Simulation
import CreateSimulation from '../screens/Forms/Simulations/CreateSimulation';
import ListSimulations from '../screens/Forms/Simulations/ListSimulations';
import GuestContactSuccess from '../screens/Forms/Simulations/GuestContactSuccess';
// PV réception
// import CreatePvReception from '../screens/Forms/PvReception/CreatePvReception';
import ListPvReceptions from '../screens/Forms/PvReception/ListPvReceptions';
// Mandat MPR
// import CreateMandatMPR from '../screens/Forms/MandatMaPrimeRenov/CreateMandatMPR';
import ListMandatsMPR from '../screens/Forms/MandatMaPrimeRenov/ListMandatsMPR';
// Mandat Synergys
// import CreateMandatSynergys from '../screens/Forms/MandatSynergys/CreateMandatSynergys';
import ListMandatsSynergys from '../screens/Forms/MandatSynergys/ListMandatsSynergys';
// Visite technique
//import CreateFicheTech from '../screens/Forms/FicheTechnique/CreateFicheTech';

// News
import ListNews from '../screens/News/ListNews';
import ViewNews from '../screens/News/ViewNews';

// Others
import Chat from '../screens/Requests/Chat';
import Profile from '../screens/Profile/Profile';
import EditEmail from '../screens/Profile/EditEmail';
import EditRole from '../screens/Profile/EditRole';
import Address from '../screens/Profile/Address';
import VideoPlayer from '../screens/Helpers/VideoPlayer';

import { constants, isTablet } from '../core/constants';
import AboutUs from '../screens/Settings/AboutUs';
import Settings from '../screens/Settings/Settings';
import SalesTermsAndConditions from '../screens/Settings/SalesTermsAndConditions';
import PrivacyPolicy from '../screens/Settings/PrivacyPolicy';
import Support from '../screens/Settings/Support';

const hideHeader = () => ({
  headerShown: false,
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="AddGoal" component={AddGoal} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="EditEmail" component={EditEmail} />
    <Stack.Screen name="EditRole" component={EditRole} /> 
    <Stack.Screen name="Address" component={Address} />
  </Stack.Navigator>
);

const UsersManagementStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="UsersManagement" component={UsersManagement} />
    <Stack.Screen name="CreateUser" component={CreateUser} />
    <Stack.Screen name="CreateTeam" component={CreateTeam} />
    <Stack.Screen name="AddMembers" component={AddMembers} />
    <Stack.Screen name="ViewTeam" component={ViewTeam} />
  </Stack.Navigator>
);

const ClientsManagementStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ClientsManagement" component={ClientsManagement} />
    <Stack.Screen name="ListClients" component={ListClients} />
    <Stack.Screen name="CreateClient" component={CreateClient} />
  </Stack.Navigator>
);

const RequestsManagementStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="RequestsManagement" component={RequestsManagement} />
    <Stack.Screen name="CreateProjectReq" component={CreateProjectReq} />
    <Stack.Screen name="CreateTicketReq" component={CreateTicketReq} />
  </Stack.Navigator>
);

const InboxStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="Inbox" component={Inbox} />
    <Stack.Screen name="ListMessages" component={ListMessages} />
    <Stack.Screen name="ViewMessage" component={ViewMessage} />
    <Stack.Screen name="NewMessage" component={NewMessage} />
    <Stack.Screen name="ListNotifications" component={ListNotifications} />
  </Stack.Navigator>
);

const AgendaStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="Agenda" component={Agenda} />
    <Stack.Screen name="CreateTask" component={CreateTask} />
    <Stack.Screen name="ListEmployees" component={ListEmployees} />
    <Stack.Screen name="DatePicker" component={DatePicker} />
  </Stack.Navigator>
);

const ProjectsStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListProjects" component={ListProjects} />
    <Stack.Screen name="CreateProject" component={CreateProject} />
    <Stack.Screen name="Process" component={Process} />
    <Stack.Screen name="Progression" component={Progression} />
  </Stack.Navigator>
);

const DocumentsStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListDocuments" component={ListDocuments} />
    <Stack.Screen name="UploadDocument" component={UploadDocument} />
    {/* <Stack.Screen name="Signature" component={Signature} /> */}
    <Stack.Screen name="PdfGeneration" component={PdfGeneration} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListOrders" component={ListOrders} />
    <Stack.Screen name="AddItem" component={AddItem} />
    <Stack.Screen name="CreateProduct" component={CreateProduct} />
    <Stack.Screen name="CreateOrder" component={CreateOrder} />
  </Stack.Navigator>
);

const SimulatorStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListSimulations" component={ListSimulations} />
    <Stack.Screen name="CreateSimulation" component={CreateSimulation} />
    <Stack.Screen name="GuestContactSuccess" component={GuestContactSuccess} />
  </Stack.Navigator>
);

const MandatMPRStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListMandatsMPR" component={ListMandatsMPR} />
    {/* <Stack.Screen name="CreateMandatMPR" component={CreateMandatMPR} /> */}
  </Stack.Navigator>
);

const MandatSynergysStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListMandatsSynergys" component={ListMandatsSynergys} />
    {/* <Stack.Screen name="CreateMandatSynergys" component={CreateMandatSynergys} /> */}
  </Stack.Navigator>
);

const NewsStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListNews" component={ListNews} />
    <Stack.Screen name="ViewNews" component={ViewNews} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="AboutUs" component={AboutUs} />
    <Stack.Screen name="SalesTermsAndConditions" component={SalesTermsAndConditions} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    <Stack.Screen name="Support" component={Support} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// GUEST APP
const SimulatorStackGuest = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="CreateSimulation" component={CreateSimulation} />
    <Stack.Screen name="GuestContactSuccess" component={GuestContactSuccess} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
  </Stack.Navigator>
);

const NewsStackGuest = () => (
  <Stack.Navigator screenOptions={hideHeader}>
    <Stack.Screen name="ListNews" component={ListNews} />
    <Stack.Screen name="ViewNews" component={ViewNews} />
  </Stack.Navigator>
);

const GuestTab = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Auth') {
          iconName = faArrowToRight;
        } else if (route.name === 'Simulation') {
          iconName = faVials;
        } else if (route.name === 'AboutUs') {
          iconName = faInfo;
        } else if (route.name === 'News') {
          iconName = faNewspaper;
        }

        return <CustomIcon icon={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.gray_dark,
      tabBarLabelStyle: {
        fontSize: isTablet ? 22 : undefined,
      },
    })}
    initialRouteName="Auth"
  >
    <Tab.Screen name="Simulation" component={SimulatorStackGuest} />
    <Tab.Screen name="News" component={NewsStackGuest} />
    <Tab.Screen name="AboutUs" component={AboutUs} />
    <Tab.Screen name="Auth" component={AuthStack} />
  </Tab.Navigator>
);

const AppStack = () => (
  <Drawer.Navigator initialRouteName="DashboardStack">
    <Drawer.Screen name="DashboardStack" component={DashboardStack} />
    <Drawer.Screen name="ProjectsStack" component={ProjectsStack} />
    <Drawer.Screen name="ProfileStack" component={ProfileStack} />
    <Drawer.Screen name="UsersManagementStack" component={UsersManagementStack} />
    <Drawer.Screen name="ClientsManagementStack" component={ClientsManagementStack} />
    <Drawer.Screen name="RequestsManagementStack" component={RequestsManagementStack} />
    <Drawer.Screen name="InboxStack" component={InboxStack} />
    <Drawer.Screen name="AgendaStack" component={AgendaStack} />
    <Drawer.Screen name="DocumentsStack" component={DocumentsStack} />
    <Drawer.Screen name="OrdersStack" component={OrdersStack} />
    <Drawer.Screen name="SimulatorStack" component={SimulatorStack} />
    <Drawer.Screen name="MandatMPRStack" component={MandatMPRStack} />
    <Drawer.Screen name="MandatSynergysStack" component={MandatSynergysStack} />
    <Drawer.Screen name="NewsStack" component={NewsStack} />
    <Drawer.Screen name="SettingsStack" component={SettingsStack} />
  </Drawer.Navigator>
);

export { GuestTab, AppStack };