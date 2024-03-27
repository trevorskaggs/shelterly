import { render, screen, fireEvent, waitForElement, waitForDomChange } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import nock from 'nock';
import PhotoDocuments from '../PhotoDocuments';

// Nock API chain
nock('http://localhost')
  // PATCH edit photo document
  .patch('/api/animals/')
  .twice()
  .reply(201, { images: [] });

describe('PhotoDocuments', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      object: 'animal',
      data: {
        images: [
          { id: '1', name: 'image1.jpg', url: '/static/images/image1.jpg' },
          { id: '2', name: 'image2.jpg', url: '/static/images/image2.jpg' },
          { id: '3', name: 'image3.pdf', url: '/static/files/image3.pdf' }
        ]
      },
      setData: jest.fn(),
      url: '/api/animals/'
    };
    wrapper = render(<PhotoDocuments {...props} />);
  });

  it('should render the photo documents', () => {
    const cardElements = wrapper.container.querySelectorAll('div.border.rounded.animal-hover-div > a.animal-link');
    const [image1Element, image2Element, image3Element] = cardElements;

    expect(cardElements).toHaveLength(3);
    expect(image1Element.href).toMatch(new RegExp(/.*\/static\/images\/image1\.jpg$/));
    expect(image2Element.href).toMatch(new RegExp(/.*\/static\/images\/image2\.jpg$/));
    expect(image3Element.href).toMatch(new RegExp(/.*\/static\/files\/image3\.pdf$/));
  });

  it('should handle edit photo document name', async () => {
    const editIcons = screen.getAllByLabelText('Edit photo document name');

    // first user action
    userEvent.click(editIcons[0]);
    const editModalTitle = await screen.findByText('Edit Photo Document');
    expect(editModalTitle).toBeInTheDocument();

    // second user action
    const saveButton = screen.getByText('Save');
    userEvent.click(saveButton);
    await waitForDomChange(() => {
      expect(props.setData).toHaveBeenCalledTimes(1);
    })
  });

  it('should handle remove photo document', async () => {
    const removeIcons = screen.getAllByLabelText('Remove photo document');

    // first user action
    userEvent.click(removeIcons[0]);
    const removeModalTitle = await screen.findByText('Confirm Photo Document Removal');
    expect(removeModalTitle).toBeInTheDocument();

    // second user acton
    const yesButton = screen.getByText('Yes');
    userEvent.click(yesButton);
    await waitForDomChange(() => {
      expect(props.setData).toHaveBeenCalledTimes(2);
    });
  });
});