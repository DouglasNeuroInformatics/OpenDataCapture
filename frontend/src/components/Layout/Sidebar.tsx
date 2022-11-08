import React from 'react';

import { faHome, faPlus, faFaceSmile, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

interface SidebarItem {
  label: string;
  icon: FontAwesomeIconProps['icon'];
  to: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Home',
    icon: faHome,
    to: '/',
  },
  {
    label: 'Add Patient',
    icon: faPlus,
    to: '/add-patient',
  },
  {
    label: 'Happiness Scale',
    icon: faFaceSmile,
    to: '/happiness-scale',
  },
  {
    label: 'View Patients',
    icon: faMagnifyingGlass,
    to: '/view-patients',
  },
];

const Sidebar = () => {
  return (
    <div className="d-flex flex-column p-3 text-light bg-dark" style={{ width: '280px' }}>
      <span className="fs-4 text-center">DNP Portal</span>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {sidebarItems.map((item) => (
          <li className="nav-item" key={item.label}>
            <NavLink className="nav-link text-light" to={item.to}>
              <FontAwesomeIcon className="me-2" icon={item.icon} style={{ minWidth: '25px' }} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

/*
const Sidebar = () => {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark" style={{ width: '280px' }}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <svg className="bi pe-none me-2" width="40" height="32"><use xlinkHref="#bootstrap"></use></svg>
        <span className="fs-4">DNP</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {sidebarItems.map((item) => (
          <li className="nav-item" key={item.label}>
            <NavLink className='nav-link' to={item.to}>
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
*/
export default Sidebar;
