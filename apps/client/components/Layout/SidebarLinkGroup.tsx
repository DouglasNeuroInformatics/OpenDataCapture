import React, { useState } from 'react';

import { ChevronRightIcon } from '@heroicons/react/24/solid';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

const SidebarLinkGroup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconStyle = isOpen ? { transform: 'rotate(90deg)' } : undefined;
  const collapseContainerId = crypto.randomUUID();

  return (
    <React.Fragment>
      <Button
        aria-controls={collapseContainerId}
        aria-expanded={isOpen}
        className="nav-link d-flex align-items-center text-light"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRightIcon className="btn-collapse me-2" height="24" style={iconStyle} width="24" />
        <span>Instruments</span>
      </Button>
      <Collapse in={isOpen}>
        <div id={collapseContainerId} style={{ marginLeft: 24 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <a className="d-block text-light ms-2" href="#" key={i}>
              Test {i}
            </a>
          ))}
        </div>
      </Collapse>
    </React.Fragment>
  );
};

export default SidebarLinkGroup;
